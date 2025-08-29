/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, methodNotAllowed, parseQuery, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'GET') return methodNotAllowed();
  const supabase = getClient(req);
  const url = new URL(req.url);
  const q = parseQuery(url);
  const { from, to } = q as Record<string,string>;

  try {
    await requireRole(req, ['admin','doctor']);

    // Who am I?
    const { data: me } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    // Scope filter: if doctor, restrict to assigned patients via doctor_patient_map
    let patientFilter: string[] = [];
    if (me?.role === 'doctor') {
      const { data: maps } = await supabase
        .from('doctor_patient_map')
        .select('patient_id');
      patientFilter = (maps || []).map((m: any) => m.patient_id);
      if (!patientFilter.length) {
        return json({
          totals: { patients: 0, appointments_pending: 0 },
          risk_distribution: { low: 0, medium: 0, high: 0 },
          top_conditions: [],
        });
      }
    }

    // Totals: patients count
    let patientsCount = 0;
    if (patientFilter.length) {
      const { count } = await supabase.from('patients').select('id', { count: 'exact', head: true }).in('id', patientFilter);
      patientsCount = count ?? 0;
    } else {
      const { count } = await supabase.from('patients').select('id', { count: 'exact', head: true });
      patientsCount = count ?? 0;
    }

    // Appointments pending count (scheduled)
    let apptQuery = supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'scheduled');
    if (from) apptQuery = apptQuery.gte('scheduled_at', from);
    if (to) apptQuery = apptQuery.lte('scheduled_at', to);
    if (patientFilter.length) apptQuery = apptQuery.in('patient_id', patientFilter);
    const { count: apptPending } = await apptQuery;

    // Risk distribution from predictions (latest per patient approximated by ordering)
    let predQuery = supabase
      .from('predictions')
      .select('patient_id,risk_score,created_at')
      .order('created_at', { ascending: false });
    if (from) predQuery = predQuery.gte('created_at', from);
    if (to) predQuery = predQuery.lte('created_at', to);
    if (patientFilter.length) predQuery = predQuery.in('patient_id', patientFilter);
    const { data: preds } = await predQuery;

    // Compute latest per patient and bucket
    const seen = new Set<string>();
    let low = 0, medium = 0, high = 0;
    const topCount: Record<string, number> = {};
    for (const p of preds || []) {
      if (seen.has(p.patient_id)) continue;
      seen.add(p.patient_id);
      const rs = Number(p.risk_score ?? 0);
      if (rs < 0.33) low++; else if (rs < 0.66) medium++; else high++;
    }

    // Top conditions by predictions.high_risk_conditions (requires extra select)
    let condQuery = supabase
      .from('predictions')
      .select('patient_id,high_risk_conditions')
      .order('created_at', { ascending: false });
    if (patientFilter.length) condQuery = condQuery.in('patient_id', patientFilter);
    const { data: condRows } = await condQuery;
    const seenC = new Set<string>();
    for (const row of condRows || []) {
      if (seenC.has(row.patient_id)) continue;
      seenC.add(row.patient_id);
      const arr = Array.isArray(row.high_risk_conditions) ? row.high_risk_conditions : [];
      for (const c of arr) topCount[String(c)] = (topCount[String(c)] || 0) + 1;
    }
    const top_conditions = Object.entries(topCount)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 10)
      .map(([condition, count]) => ({ condition, count }));

    return json({
      totals: { patients: patientsCount, appointments_pending: apptPending ?? 0 },
      risk_distribution: { low, medium, high },
      top_conditions,
    });
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
