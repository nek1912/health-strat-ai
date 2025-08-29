-- patient_metrics table and RLS policies
create table if not exists public.patient_metrics (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  metric_type text not null,
  metric_value double precision not null,
  metric_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.patient_metrics enable row level security;

-- Allow patients to read their own metrics
create policy if not exists patient_metrics_select_patient_self
on public.patient_metrics for select
using (
  exists (
    select 1 from public.patients p
    where p.id = patient_metrics.patient_id
      and p.user_id = auth.uid()
  )
);

-- Allow staff (admin/doctor/nurse) to read metrics
create policy if not exists patient_metrics_select_staff
on public.patient_metrics for select
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role in ('admin','doctor','nurse')
  )
);

-- Allow patients to insert their own metrics
create policy if not exists patient_metrics_insert_patient_self
on public.patient_metrics for insert
with check (
  exists (
    select 1 from public.patients p
    where p.id = patient_metrics.patient_id
      and p.user_id = auth.uid()
  )
);

-- Allow staff to insert metrics
create policy if not exists patient_metrics_insert_staff
on public.patient_metrics for insert
with check (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role in ('admin','doctor','nurse')
  )
);

-- Allow staff to update/delete
create policy if not exists patient_metrics_update_staff
on public.patient_metrics for update
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role in ('admin','doctor','nurse')
  )
)
with check (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role in ('admin','doctor','nurse')
  )
);

create policy if not exists patient_metrics_delete_staff
on public.patient_metrics for delete
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role in ('admin','doctor','nurse')
  )
);
