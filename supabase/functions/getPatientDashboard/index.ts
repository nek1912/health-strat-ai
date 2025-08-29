/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, parseQuery, readJson, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed();
  const supabase = getClient(req);

  try {
    // Accept patient_id from query or body (POST). RLS will ensure access is permitted.
    let patient_id: string | null = null;
    if (req.method === 'GET') {
      const q = parseQuery(new URL(req.url));
      patient_id = (q.patient_id as string) || null;
    } else {
      const body = await readJson<any>(req);
      patient_id = body?.patient_id ?? null;
    }
    if (!patient_id) return badRequest('patient_id is required');

    // Optional: allow only admins/doctors/patients; nurses may be read-only depending on RLS
    await requireRole(req, ['admin','doctor','nurse','patient']);

    const [patientRes, visitsRes, labsRes, rxRes, predsRes, metricsRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patient_id).single(),
      supabase.from('visits').select('*').eq('patient_id', patient_id).order('visit_date', { ascending: false }),
      supabase.from('lab_results').select('*').eq('patient_id', patient_id).order('test_date', { ascending: false }),
      supabase.from('prescriptions').select('*').eq('patient_id', patient_id).order('start_date', { ascending: false }),
      supabase.from('predictions').select('*').eq('patient_id', patient_id).order('created_at', { ascending: false }).limit(1),
      supabase.from('patient_metrics').select('*').eq('patient_id', patient_id).order('metric_date', { ascending: false }).limit(200),
    ]);

    const err = patientRes.error || visitsRes.error || labsRes.error || rxRes.error || predsRes.error || metricsRes.error;
    if (err) throw err;

    return json({
      patient: patientRes.data,
      visits: visitsRes.data ?? [],
      labResults: labsRes.data ?? [],
      prescriptions: rxRes.data ?? [],
      latestPrediction: (predsRes.data && predsRes.data[0]) || null,
      metrics: metricsRes.data ?? [],
    });
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
