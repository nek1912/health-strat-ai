import { supabase } from './client';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const base = `${supabaseUrl}/functions/v1`;

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fnGetAssignedPatients(params: { search?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/getAssignedPatients?${qs.toString()}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnAnalytics(params: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/analytics?${qs.toString()}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnGetAppointments(params: { patient_id?: string; doctor_id?: string; from?: string; to?: string; status?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) qs.set(k, String(v));
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/appointments?${qs.toString()}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnCreateAppointment(body: { patient_id: string; doctor_id: string; scheduled_at: string; reason?: string }) {
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/appointments`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnUpdateAppointment(body: { id: string; scheduled_at?: string; reason?: string; status?: string; doctor_id?: string }) {
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/appointments`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnDeleteAppointment(id: string) {
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/appointments?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fnTriggerPrediction(patient_id: string) {
  const headers = { 'content-type': 'application/json', ...(await authHeader()) } as HeadersInit;
  const res = await fetch(`${base}/getPrediction`, { method: 'POST', headers, body: JSON.stringify({ patient_id }) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
