/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, requireRole, readJson } from '../_shared/utils.ts';

// Placeholder ML integration. If Deno.env.ML_PREDICT_URL is set, forward the request body there.
// Otherwise, return a mocked prediction. Always store the result in 'predictions'.
export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return methodNotAllowed();
  try {
    await requireRole(req, ['admin','doctor']);
    const body = await readJson<any>(req);
    const { patient_id, features, override } = body || {};
    if (!patient_id) return badRequest('patient_id is required');

    let prediction: { risk_score: number; high_risk_conditions: string[]; explanation?: any };

    const mlUrl = Deno.env.get('ML_PREDICT_URL');
    const mlKey = Deno.env.get('ML_PREDICT_API_KEY');

    if (override && (override.risk_score !== undefined)) {
      prediction = {
        risk_score: Number(override.risk_score),
        high_risk_conditions: override.high_risk_conditions ?? [],
        explanation: override.explanation ?? null,
      };
    } else if (mlUrl) {
      const resp = await fetch(mlUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(mlKey ? { 'authorization': `Bearer ${mlKey}` } : {}),
        },
        body: JSON.stringify({ patient_id, features }),
      });
      if (!resp.ok) throw new Error(`ML API error: ${resp.status}`);
      const m = await resp.json();
      prediction = {
        risk_score: Number(m?.risk_score ?? 0),
        high_risk_conditions: Array.isArray(m?.high_risk_conditions) ? m.high_risk_conditions : [],
        explanation: m?.explanation ?? m ?? null,
      };
    } else {
      // Mock
      const score = Math.random();
      prediction = {
        risk_score: score,
        high_risk_conditions: score > 0.7 ? ['Hypertension'] : score > 0.4 ? ['Prediabetes'] : [],
        explanation: { source: 'mock' },
      };
    }

    const supabase = getClient(req);
    const { data, error } = await supabase.from('predictions').insert({
      patient_id,
      risk_score: prediction.risk_score,
      high_risk_conditions: prediction.high_risk_conditions,
      explanation: prediction.explanation ?? null,
    }).select('*').single();
    if (error) throw error;

    return json({ patient_id, ...prediction, record: data }, 201);
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
