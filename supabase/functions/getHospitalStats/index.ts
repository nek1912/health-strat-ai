/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, json, methodNotAllowed, requireRole } from '../_shared/utils.ts';

export async function handle(req: Request): Promise<Response> {
  const supabase = getClient(req);

  try {
    switch (req.method) {
      case 'GET': {
        await requireRole(req, ['admin']);
        const { data: patients, error: pErr } = await supabase
          .from('patients')
          .select('id, risk_score, diagnosis');
        if (pErr) throw pErr;

        const totals = { patients: patients?.length ?? 0 };
        return json({ totals });
      }
      default:
        return methodNotAllowed();
    }
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
}

Deno.serve(handle);
