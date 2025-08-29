/// <reference path="./deno-globals.d.ts" />
// Shared utilities for Supabase Edge Functions (Deno)
// Security: use RLS by passing through the caller's Authorization header.

// @ts-ignore - URL import is valid in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type Role = 'admin' | 'doctor' | 'nurse' | 'patient';

type JSONInit = number | ResponseInit | undefined;

export const json = (data: unknown, init?: JSONInit) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(typeof init === 'number' ? {} : init?.headers || {}),
    },
  });

export const badRequest = (msg: string) => json({ error: msg }, 400);
export const unauthorized = (msg = 'Unauthorized') => json({ error: msg }, 401);
export const forbidden = (msg = 'Forbidden') => json({ error: msg }, 403);
export const notFound = (msg = 'Not found') => json({ error: msg }, 404);
export const methodNotAllowed = () => json({ error: 'Method not allowed' }, 405);

export const getClient = (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  return client;
};

export const getServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, serviceKey);
};

export const getUser = async (req: Request) => {
  const client = getClient(req);
  const { data, error } = await client.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
};

export const requireUser = async (req: Request) => {
  const { user } = await getUser(req);
  if (!user) throw new Error('unauthorized');
  return user;
};

export const requireRole = async (req: Request, roles: Role[] | Role) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  // Test bypass to allow unit tests without real auth
  if (Deno.env.get('TEST_BYPASS_AUTH') === 'true') {
    return { id: 'test-user', role: allowed[0] } as any;
  }
  const client = getClient(req);
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, role')
    .eq('id', (await client.auth.getUser()).data.user?.id)
    .single();
  if (error) throw new Error('unauthorized');
  if (!profile || !allowed.includes(profile.role as Role)) throw new Error('forbidden');
  return profile;
};

export const parseQuery = (url: URL) => Object.fromEntries(url.searchParams.entries());

export const readJson = async <T=any>(req: Request): Promise<T> => {
  try {
    const body = await req.text();
    return body ? JSON.parse(body) : ({} as T);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
};
