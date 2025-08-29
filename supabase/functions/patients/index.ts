/// <reference path="../_shared/deno-globals.d.ts" />

import { getClient, json, badRequest, methodNotAllowed, requireRole, parseQuery, readJson } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);

  try {
    switch (req.method) {
      case 'GET': {
        const q = parseQuery(url);
        const { name, id, diagnosis, min_risk, max_risk, limit = '50', offset = '0' } = q as Record<string, string>;
        let query = supabase.from('patients').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (id) query = query.eq('id', id);
        if (name) query = query.ilike('name', `%${name}%`);
        if (diagnosis) query = query.ilike('diagnosis', `%${diagnosis}%`);
        if (min_risk) query = query.gte('risk_score', Number(min_risk));
        if (max_risk) query = query.lte('risk_score', Number(max_risk));
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        if (!body?.name) return badRequest('name is required');
        const { data, error } = await supabase.from('patients').insert({
          name: body.name,
          age: body.age ?? null,
          gender: body.gender ?? null,
          diagnosis: body.diagnosis ?? null,
          risk_score: body.risk_score ?? 0,
          user_id: body.user_id ?? null,
        }).select('*').single();
        if (error) throw error;
        return json({ data }, 201);
      }
      case 'PATCH': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        const id = body?.id as string;
        if (!id) return badRequest('id is required');
        const { data, error } = await supabase.from('patients').update({
          name: body.name,
          age: body.age,
          gender: body.gender,
          diagnosis: body.diagnosis,
          risk_score: body.risk_score,
        }).eq('id', id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case 'DELETE': {
        await requireRole(req, ['admin']);
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return badRequest('id is required');
        const { error } = await supabase.from('patients').delete().eq('id', id);
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
