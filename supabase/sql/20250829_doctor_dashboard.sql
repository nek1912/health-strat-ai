-- Doctor Dashboard schema additions
-- Mapping table between doctors and patients
create table if not exists public.doctor_patient_map (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (doctor_id, patient_id)
);

alter table public.doctor_patient_map enable row level security;

-- Doctors can see their own mappings; admins can see all
create policy if not exists dpm_select_doctor
on public.doctor_patient_map for select
using (
  doctor_id = auth.uid() or exists (
    select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'
  )
);

-- Admins manage mappings
create policy if not exists dpm_admin_all
on public.doctor_patient_map for all
using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
)
with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

-- Log each ML prediction request/response
create table if not exists public.prediction_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.prediction_requests enable row level security;

-- Doctors can insert logs for their own calls
create policy if not exists pr_insert_doctor
on public.prediction_requests for insert
with check (
  doctor_id = auth.uid()
);

-- Doctors can read only their own logs; admins can read all; patients can read their own logs
create policy if not exists pr_select_scoped
on public.prediction_requests for select
using (
  doctor_id = auth.uid()
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1 from public.patients p where p.id = prediction_requests.patient_id and p.user_id = auth.uid()
  )
);
