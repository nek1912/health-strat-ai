/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('analytics only allows GET', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const res = await handle(new Request('http://localhost/analytics', { method: 'POST' }));
  if (res.status !== 405) throw new Error('Expected 405 for non-GET');
});

Deno.test('analytics returns Response', async () => {
  const res = await handle(new Request('http://localhost/analytics?from=2025-01-01', { method: 'GET' }));
  if (!(res instanceof Response)) throw new Error('Expected Response');
});
