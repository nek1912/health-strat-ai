/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('patients POST requires name', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const req = new Request('http://localhost/patients', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  const res = await handle(req);
  const body = await res.json();
  if (res.status !== 400 || !body.error) {
    throw new Error('Expected 400 for missing name');
  }
});

Deno.test('patients GET supports basic query params', async () => {
  const req = new Request('http://localhost/patients?name=john&limit=1', { method: 'GET' });
  const res = await handle(req);
  if (!(res instanceof Response)) throw new Error('Expected Response');
});
