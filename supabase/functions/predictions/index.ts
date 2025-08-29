/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, requireRole, parseQuery, readJson } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);

  try {
    switch (req.method) {
      case 'GET': {
        const q = parseQuery(url);
        const { patient_id, limit = '50', offset = '0' } = q as Record<string, string>;
        let query = supabase.from('predictions').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (patient_id) query = query.eq('patient_id', patient_id);
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin','doctor']);
        const body = await readJson<any>(req);
        if (!body?.patient_id) return badRequest('patient_id is required');
        const { data, error } = await supabase.from('predictions').insert({
          patient_id: body.patient_id,
          risk_score: body.risk_score ?? null,
          high_risk_conditions: body.high_risk_conditions ?? null,
          explanation: body.explanation ?? null,
        }).select('*').single();
        if (error) throw error;
        return json({ data }, 201);
      }
      case 'PATCH': {
        await requireRole(req, ['admin','doctor']);
        const body = await readJson<any>(req);
        const id = body?.id as string;
        if (!id) return badRequest('id is required');
        const { data, error } = await supabase.from('predictions').update({
          risk_score: body.risk_score,
          high_risk_conditions: body.high_risk_conditions,
          explanation: body.explanation,
        }).eq('id', id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case 'DELETE': {
        await requireRole(req, ['admin','doctor']);
        const id = url.searchParams.get('id');
        if (!id) return badRequest('id is required');
        const { error } = await supabase.from('predictions').delete().eq('id', id);
        if (error) throw error;
        return json({ success: true });
      }
      default:
        return methodNotAllowed();
    }
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
