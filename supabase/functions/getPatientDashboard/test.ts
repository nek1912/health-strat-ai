/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('getPatientDashboard requires patient_id', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  const res = await handle(new Request('http://localhost/getPatientDashboard', { method: 'GET' }));
  if (res.status !== 400) throw new Error('Expected 400 when missing patient_id');
});

Deno.test('getPatientDashboard returns Response', async () => {
  const res = await handle(new Request('http://localhost/getPatientDashboard?patient_id=00000000-0000-0000-0000-000000000000', { method: 'GET' }));
  if (!(res instanceof Response)) throw new Error('Expected Response');
});
