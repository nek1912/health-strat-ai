/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('iotMetrics GET requires patient_id', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const res = await handle(new Request('http://localhost/iotMetrics', { method: 'GET' }));
  if (res.status !== 400) throw new Error('Expected 400 when missing patient_id');
});

Deno.test('iotMetrics POST validates required fields', async () => {
  const req = new Request('http://localhost/iotMetrics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  const res = await handle(req);
  if (res.status !== 400) throw new Error('Expected 400 for missing fields');
});
