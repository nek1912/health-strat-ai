/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, readJson, parseQuery, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);
  try {
    switch (req.method) {
      case 'GET': {
        await requireRole(req, ['admin','doctor','patient']);
        const q = parseQuery(url);
        const { patient_id, doctor_id, from, to, status, limit = '50', offset = '0' } = q as Record<string,string>;
        let query = supabase.from('appointments').select('*', { count: 'exact' }).order('scheduled_at', { ascending: true });
        if (patient_id) query = query.eq('patient_id', patient_id);
        if (doctor_id) query = query.eq('doctor_id', doctor_id);
        if (status) query = query.eq('status', status);
        if (from) query = query.gte('scheduled_at', from);
        if (to) query = query.lte('scheduled_at', to);
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin','doctor']);
        const body = await readJson<any>(req);
        const { patient_id, doctor_id, scheduled_at, reason } = body || {};
        if (!patient_id || !doctor_id || !scheduled_at) return badRequest('patient_id, doctor_id, scheduled_at are required');
        const { data, error } = await supabase.from('appointments').insert({ patient_id, doctor_id, scheduled_at, reason }).select('*').single();
        if (error) throw error;
        return json({ data }, 201);
      }
      case 'PATCH': {
        await requireRole(req, ['admin','doctor']);
        const body = await readJson<any>(req);
        if (!body?.id) return badRequest('id is required');
        const update: any = {};
        for (const k of ['scheduled_at','reason','status','doctor_id']) if (body[k] !== undefined) update[k] = body[k];
        const { data, error } = await supabase.from('appointments').update(update).eq('id', body.id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case 'DELETE': {
        await requireRole(req, ['admin','doctor']);
        const id = url.searchParams.get('id');
        if (!id) return badRequest('id is required');
        const { error } = await supabase.from('appointments').delete().eq('id', id);
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
