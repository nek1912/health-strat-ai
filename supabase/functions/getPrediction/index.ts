/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, readJson, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return methodNotAllowed();

  try {
    // Ensure only doctor/admin can trigger
    await requireRole(req, ['doctor','admin']);

    const supabase = getClient(req);
    const body = await readJson<any>(req);
    const patient_id = body?.patient_id as string | undefined;
    if (!patient_id) return badRequest('patient_id is required');

    // Optional doctor_id from auth via profiles
    const { data: me, error: meErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    if (meErr) throw meErr;

    // Verify doctor is assigned to this patient unless admin
    if (me?.role !== 'admin') {
      const { data: map, error: mapErr } = await supabase
        .from('doctor_patient_map')
        .select('id')
        .eq('doctor_id', me?.id)
        .eq('patient_id', patient_id)
        .maybeSingle();
      if (mapErr) throw mapErr;
      if (!map) return json({ error: 'not assigned to patient' }, 403);
    }

    // Fetch recent metrics to send to ML API
    const { data: metrics, error: mErr } = await supabase
      .from('patient_metrics')
      .select('*')
      .eq('patient_id', patient_id)
      .order('metric_date', { ascending: false })
      .limit(200);
    if (mErr) throw mErr;

    const mlApi = Deno.env.get('ML_MODEL_API');
    if (!mlApi) return json({ error: 'ML_MODEL_API not configured' }, 500);

    const mlReq = { patient_id, metrics };
    const resp = await fetch(`${mlApi}/predict`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mlReq),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`ML API error ${resp.status}: ${text}`);
    }
    const prediction = await resp.json();

    // Log request/response
    const { error: logErr } = await supabase
      .from('prediction_requests')
      .insert({
        patient_id,
        doctor_id: me?.id,
        request_payload: mlReq,
        response_payload: prediction,
      });
    if (logErr) throw logErr;

    // Optionally store to predictions table for history/analytics if present
    await supabase.from('predictions').insert({
      patient_id,
      risk_score: Number(prediction?.risk_score ?? 0),
      high_risk_conditions: Array.isArray(prediction?.high_risk_conditions) ? prediction.high_risk_conditions : [],
      explanation: prediction?.explanation ?? prediction ?? null,
    });

    return json(prediction);
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
