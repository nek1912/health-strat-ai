-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Roles enum
create type public.user_role as enum ('admin','doctor','nurse','patient');

-- Profiles (mirror of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role public.user_role not null default 'patient',
  full_name text,
  created_at timestamptz not null default now()
);

-- Helper: set email from auth trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'patient')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new auth users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: role check
create or replace function public.has_role(r public.user_role)
returns boolean as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = r
  );
$$ language sql stable;

-- Departments
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Doctors
create table if not exists public.doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  specialty text,
  department_id uuid references public.departments(id) on delete set null,
  contact text,
  created_at timestamptz not null default now()
);

-- Nurses/Staff (generic staff table)
create table if not exists public.staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  role text check (role in ('nurse','staff')) not null,
  name text not null,
  department_id uuid references public.departments(id) on delete set null,
  contact text,
  created_at timestamptz not null default now()
);

-- Patients
create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  age int,
  gender text,
  diagnosis text,
  risk_score double precision default 0,
  created_at timestamptz not null default now()
);

-- Assignments: patient to doctor
create table if not exists public.patient_doctor (
  patient_id uuid references public.patients(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete cascade,
  primary key (patient_id, doctor_id)
);

-- Medical history
create table if not exists public.medical_history (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade,
  description text,
  recorded_at timestamptz not null default now()
);

-- Lab results metadata (files in storage bucket 'lab-results')
create table if not exists public.lab_results (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade,
  file_path text not null,
  file_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  parsed_metadata jsonb,
  created_at timestamptz not null default now()
);

-- Prescriptions
create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  medication text not null,
  dosage text,
  instructions text,
  created_at timestamptz not null default now()
);

-- Predictions (AI)
create table if not exists public.predictions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade,
  risk_score double precision,
  high_risk_conditions text[],
  explanation jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  meta jsonb,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.doctors enable row level security;
alter table public.staff enable row level security;
alter table public.patients enable row level security;
alter table public.patient_doctor enable row level security;
alter table public.medical_history enable row level security;
alter table public.lab_results enable row level security;
alter table public.prescriptions enable row level security;
alter table public.predictions enable row level security;
alter table public.notifications enable row level security;

-- Policies: profiles
create policy "profiles_self_read" on public.profiles for select using (id = auth.uid() or public.has_role('admin'));
create policy "profiles_admin_write" on public.profiles for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: departments (admin manage, everyone read)
create policy "dept_read_all" on public.departments for select using (true);
create policy "dept_admin_write" on public.departments for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: doctors (read all, admin write)
create policy "doctors_read_all" on public.doctors for select using (true);
create policy "doctors_admin_write" on public.doctors for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: staff (read all, admin write)
create policy "staff_read_all" on public.staff for select using (true);
create policy "staff_admin_write" on public.staff for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: patients
create policy "patients_read_admin_doctor_self" on public.patients for select using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = patients.id and d.user_id = auth.uid())
  or patients.user_id = auth.uid()
);
create policy "patients_admin_write" on public.patients for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: patient_doctor admin manage
create policy "pd_admin_all" on public.patient_doctor for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Policies: medical_history (read by admin/assigned doctor/patient self, write by admin/assigned doctor)
create policy "mh_read" on public.medical_history for select using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = medical_history.patient_id and d.user_id = auth.uid())
  or exists(select 1 from public.patients p where p.id = medical_history.patient_id and p.user_id = auth.uid())
);
create policy "mh_write" on public.medical_history for all using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = medical_history.patient_id and d.user_id = auth.uid())
) with check (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = medical_history.patient_id and d.user_id = auth.uid())
);

-- Policies: lab_results (read admin/assigned doctor/patient self; write admin/doctor)
create policy "lab_read" on public.lab_results for select using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = lab_results.patient_id and d.user_id = auth.uid())
  or exists(select 1 from public.patients p where p.id = lab_results.patient_id and p.user_id = auth.uid())
);
create policy "lab_write" on public.lab_results for all using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = lab_results.patient_id and d.user_id = auth.uid())
) with check (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = lab_results.patient_id and d.user_id = auth.uid())
);

-- Policies: prescriptions (read admin/assigned doctor/patient self; write admin/doctor)
create policy "rx_read" on public.prescriptions for select using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = prescriptions.patient_id and d.user_id = auth.uid())
  or exists(select 1 from public.patients p where p.id = prescriptions.patient_id and p.user_id = auth.uid())
);
create policy "rx_write" on public.prescriptions for all using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = prescriptions.patient_id and d.user_id = auth.uid())
) with check (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = prescriptions.patient_id and d.user_id = auth.uid())
);

-- Policies: predictions (read admin/assigned doc/patient; write admin/doctor)
create policy "pred_read" on public.predictions for select using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = predictions.patient_id and d.user_id = auth.uid())
  or exists(select 1 from public.patients p where p.id = predictions.patient_id and p.user_id = auth.uid())
);
create policy "pred_write" on public.predictions for all using (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = predictions.patient_id and d.user_id = auth.uid())
) with check (
  public.has_role('admin')
  or exists(select 1 from public.patient_doctor pd join public.doctors d on d.id = pd.doctor_id where pd.patient_id = predictions.patient_id and d.user_id = auth.uid())
);

-- Policies: notifications (recipient or admin read; admin create)
create policy "notif_read_self_admin" on public.notifications for select using (
  recipient_user_id = auth.uid() or public.has_role('admin')
);
create policy "notif_admin_write" on public.notifications for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Recommended storage bucket for lab results (run via storage SQL or dashboard)
-- select * from storage.create_bucket('lab-results', public := false);
