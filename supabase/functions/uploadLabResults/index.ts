/// <reference path="../_shared/deno-globals.d.ts" />
import { getClient, getServiceClient, json, badRequest, methodNotAllowed, requireRole, readJson } from '../_shared/utils.ts';

// This function returns a signed URL for client upload (CSV/PDF) and optionally records metadata after upload.
// Security: Admin-only to request upload URLs and register records.
export async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  try {
    switch (req.method) {
      case 'POST': {
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        const { patient_id, file_name, file_type } = body || {};
        if (!patient_id || !file_name) return badRequest('patient_id and file_name are required');

        const service = getServiceClient();
        const bucket = 'lab-results';
        const objectPath = `${patient_id}/${crypto.randomUUID()}_${file_name}`;

        // Create a signed URL for direct upload from the client (valid 10 minutes)
        const { data: signed, error: sErr } = await service.storage
          .from(bucket)
          // Using createSignedUploadUrl when available; fallback to signedUrl for put if not
          // @ts-ignore Deno types
          .createSignedUploadUrl ?
            // @ts-ignore
            service.storage.from(bucket).createSignedUploadUrl(objectPath) :
            service.storage.from(bucket).createSignedUrl(objectPath, 600, { download: false })
        ;
        if (sErr) throw sErr;

        return json({
          bucket,
          path: objectPath,
          upload: signed,
        }, 201);
      }
      case 'PUT': {
        // After client uploads, admin can register metadata record
        await requireRole(req, ['admin']);
        const body = await readJson<any>(req);
        const { patient_id, path, file_type, parsed_metadata } = body || {};
        if (!patient_id || !path) return badRequest('patient_id and path are required');
        const supabase = getClient(req);
        const { data, error } = await supabase.from('lab_results').insert({
          patient_id,
          file_path: path,
          file_type: file_type ?? null,
          parsed_metadata: parsed_metadata ?? null,
        }).select('*').single();
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
