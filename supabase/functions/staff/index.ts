/// <reference path="../_shared/deno-globals.d.ts" />

import { getClient, json, badRequest, methodNotAllowed, requireRole, parseQuery, readJson } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);

  try {
    switch (req.method) {
      case 'GET': {
        const q = parseQuery(url);
        const { name, role, department_id, limit = '50', offset = '0' } = q as Record<string,string>;
        let query = supabase.from('staff').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (name) query = query.ilike('name', `%${name}%`);
        if (role) query = query.eq('role', role);
        if (department_id) query = query.eq('department_id', department_id);
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        if (!body?.name) return badRequest('name is required');
        const { data, error } = await supabase.from('staff').insert(body).select('*').single();
        if (error) throw error;
        return json({ data }, 201);
      }
      case 'PATCH': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        if (!body?.id) return badRequest('id is required');
        const { data, error } = await supabase.from('staff').update(body).eq('id', body.id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      case 'DELETE': {
        await requireRole(req, ['admin']);
        const id = url.searchParams.get('id');
        if (!id) return badRequest('id is required');
        const { error } = await supabase.from('staff').delete().eq('id', id);
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
