/// <reference path="../_shared/deno-globals.d.ts" />
import { handle } from './index.ts';

Deno.test('appointments supports methods and returns Response', async () => {
  Deno.env.set('TEST_BYPASS_AUTH', 'true');
  // GET
  const resGet = await handle(new Request('http://localhost/appointments?limit=1', { method: 'GET' }));
  if (!(resGet instanceof Response)) throw new Error('Expected Response');
  // Method not allowed
  const resHead = await handle(new Request('http://localhost/appointments', { method: 'HEAD' }));
  if (resHead.status !== 405) throw new Error('Expected 405 for HEAD');
});
