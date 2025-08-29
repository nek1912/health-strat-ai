/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, badRequest, methodNotAllowed, requireRole, parseQuery, readJson } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);
  const url = new URL(req.url);

  try {
    switch (req.method) {
      case 'GET': {
        const q = parseQuery(url);
        const { recipient_user_id, limit = '50', offset = '0' } = q as Record<string, string>;
        let query = supabase.from('notifications').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (recipient_user_id) query = query.eq('recipient_user_id', recipient_user_id);
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return json({ data, count });
      }
      case 'POST': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        const { recipient_user_id, title, body: message, meta } = body || {};
        if (!recipient_user_id || !title) return badRequest('recipient_user_id and title are required');
        const { data, error } = await supabase.from('notifications').insert({
          recipient_user_id,
          title,
          body: message ?? null,
          meta: meta ?? null,
        }).select('*').single();
        if (error) throw error;

        // Optional: stub for email/SMS integration
        // e.g., call an external provider using fetch with API keys from Deno.env

        return json({ data }, 201);
      }
      case 'PATCH': {
        // Mark as read
        const body = await readJson<any>(req);
        const id = body?.id as string;
        const read = Boolean(body?.read);
        if (!id) return badRequest('id is required');
        const { data, error } = await supabase.from('notifications').update({ read }).eq('id', id).select('*').single();
        if (error) throw error;
        return json({ data });
      }
      default:
        return methodNotAllowed();
    }
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
