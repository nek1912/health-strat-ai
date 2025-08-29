/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('getPrediction only allows POST', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const res = await handle(new Request('http://localhost/getPrediction', { method: 'GET' }));
  if (res.status !== 405) throw new Error('Expected 405 for non-POST');
});

Deno.test('getPrediction requires patient_id', async () => {
  const res = await handle(new Request('http://localhost/getPrediction', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }));
  if (res.status !== 400) throw new Error('Expected 400 for missing patient_id');
});
