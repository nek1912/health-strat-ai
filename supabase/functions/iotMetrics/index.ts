/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, parseQuery, readJson, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);

  try {
    switch (req.method) {
      case 'GET': {
        await requireRole(req, ['admin','doctor','nurse','patient']);
        const q = parseQuery(url);
        const { patient_id, metric_type, from, to, limit = '100', offset = '0' } = q as Record<string,string>;
        if (!patient_id) return badRequest('patient_id is required');
        let query = supabase
          .from('patient_metrics')
          .select('*', { count: 'exact' })
          .eq('patient_id', patient_id)
          .order('metric_date', { ascending: false });
        if (metric_type) query = query.eq('metric_type', metric_type);
        if (from) query = query.gte('metric_date', from);
        if (to) query = query.lte('metric_date', to);
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin','doctor','nurse','patient']);
        const body = await readJson<any>(req);
        const items = Array.isArray(body) ? body : [body];
        if (!items.length) return badRequest('empty payload');
        for (const it of items) {
          if (!it?.patient_id || !it?.metric_type || (it.metric_value === undefined)) {
            return badRequest('patient_id, metric_type, metric_value are required');
          }
        }
        const { data, error } = await supabase
          .from('patient_metrics')
          .insert(items.map((it) => ({
            patient_id: it.patient_id,
            metric_type: it.metric_type,
            metric_value: Number(it.metric_value),
            metric_date: it.metric_date ?? new Date().toISOString(),
          })))
          .select('*');
        if (error) throw error;
        return json({ data }, 201);
      }
      default:
        return methodNotAllowed();
    }
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
