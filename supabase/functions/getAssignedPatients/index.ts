/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, methodNotAllowed, parseQuery, requireRole, badRequest } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'GET') return methodNotAllowed();
  try {
    await requireRole(req, ['doctor','admin']);
    const supabase = getClient(req);
    const url = new URL(req.url);
    const q = parseQuery(url);
    const { search, limit = '50', offset = '0' } = q as Record<string,string>;

    // Find patients mapped to this doctor via RLS-protected view
    // We rely on RLS policies: doctors can see only their own mappings; admins see all
    let query = supabase
      .from('doctor_patient_map')
      .select('patient:patients(*)', { count: 'exact' })
      .order('assigned_at', { ascending: false });

    if (search) {
      // Filter on nested patient fields using ilike on columns
      // Not all PostgREST versions support implicit nested filters; fallback to filtering after fetch if needed
      const { data: maps, error, count } = await query;
      if (error) throw error;
      const filtered = (maps || []).filter((m: any) => {
        const p = m.patient || {};
        const s = search.toLowerCase();
        return (
          (p.name?.toLowerCase?.().includes(s)) ||
          (p.gender?.toLowerCase?.().includes(s)) ||
          (p.blood_group?.toLowerCase?.().includes(s))
        );
      });
      const start = Number(offset);
      const end = start + Number(limit);
      return json({ data: filtered.slice(start, end).map((m: any) => m.patient), count: count ?? filtered.length });
    }

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error, count } = await query;
    if (error) throw error;

    const patients = (data || []).map((m: any) => m.patient);
    return json({ data: patients, count });
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
