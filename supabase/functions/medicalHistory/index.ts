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
        let query = supabase.from('medical_history').select('*', { count: 'exact' }).order('recorded_at', { ascending: false });
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
        const { data, error } = await supabase.from('medical_history').insert({
          patient_id: body.patient_id,
          description: body.description ?? null,
          recorded_at: body.recorded_at ?? null,
        }).select('*').single();
        if (error) throw error;
        return json({ data }, 201);
      }
      case 'PATCH': {
        await requireRole(req, ['admin','doctor']);
        const body = await readJson<any>(req);
        const id = body?.id as string;
        if (!id) return badRequest('id is required');
        const { data, error } = await supabase.from('medical_history').update({
          description: body.description,
          recorded_at: body.recorded_at,
        }).eq('id', id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case 'DELETE': {
        await requireRole(req, ['admin','doctor']);
        const id = url.searchParams.get('id');
        if (!id) return badRequest('id is required');
        const { error } = await supabase.from('medical_history').delete().eq('id', id);
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
