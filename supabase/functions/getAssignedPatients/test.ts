/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('getAssignedPatients only allows GET', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const res = await handle(new Request('http://localhost/getAssignedPatients', { method: 'POST' }));
  if (res.status !== 405) throw new Error('Expected 405 for non-GET');
});

Deno.test('getAssignedPatients returns Response', async () => {
  const res = await handle(new Request('http://localhost/getAssignedPatients?limit=1', { method: 'GET' }));
  if (!(res instanceof Response)) throw new Error('Expected Response');
});
