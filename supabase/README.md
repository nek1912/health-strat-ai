# Hospital Admin Backend (Supabase)

This folder contains SQL schema and Supabase Edge Functions for the Hospital Admin Dashboard.

## Prerequisites
- Supabase project (URL, anon key, service role key)
- Supabase CLI installed
- Storage bucket `lab-results` (private)

## 1) Apply SQL Schema
```bash
supabase db push --local
# or
supabase db execute --file supabase/sql/01_schema.sql
```

## 2) Configure Env for Edge Functions
Set these variables in the Supabase dashboard (Project Settings → Functions → Environment Variables):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional ML integration:
  - `ML_PREDICT_URL`
  - `ML_PREDICT_API_KEY`

## 3) Deploy Functions
```bash
supabase functions deploy getHospitalStats
supabase functions deploy patients
supabase functions deploy doctors
supabase functions deploy staff
supabase functions deploy predictions
supabase functions deploy notifications
supabase functions deploy uploadLabResults
supabase functions deploy predict
supabase functions deploy getPatientDashboard
supabase functions deploy iotMetrics
supabase functions deploy getAssignedPatients
supabase functions deploy getPrediction
supabase functions deploy appointments
supabase functions deploy analytics
```

## 4) Invoke Functions (examples)
Remember to pass an authenticated JWT in `Authorization: Bearer <token>`.

- Get Hospital Stats (admin only):
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://<project>.supabase.co/functions/v1/getHospitalStats
```

- Patients search:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  'https://<project>.supabase.co/functions/v1/patients?name=john&min_risk=0.4&limit=10'
```

- Create patient (admin only):
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","age":56,"diagnosis":"Diabetes","risk_score":0.72}' \
  https://<project>.supabase.co/functions/v1/patients
```

- Request upload URL (admin only):
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patient_id":"<uuid>","file_name":"labs.csv","file_type":"text/csv"}' \
  https://<project>.supabase.co/functions/v1/uploadLabResults
```

- Register uploaded file metadata (admin only):
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patient_id":"<uuid>","path":"<returned_path>","file_type":"text/csv","parsed_metadata":{}}' \
  https://<project>.supabase.co/functions/v1/uploadLabResults
```

- Predict (admin/doctor):
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patient_id":"<uuid>","features":{}}' \
  https://<project>.supabase.co/functions/v1/predict
```

## Patient Dashboard API (Edge Function)

Path: `supabase/functions/getPatientDashboard/index.ts`

- Methods: GET, POST
- Auth: Required (JWT). Uses caller auth via `getClient(req)`; RLS enforces access.
- Roles: `admin`, `doctor`, `nurse`, `patient`
- Params:
  - `patient_id` (string) via query (GET) or JSON body (POST)

Example (GET):
```bash
curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$SUPABASE_FUNCTIONS_URL/getPatientDashboard?patient_id=<PATIENT_ID>"
```

Response:
```json
{
  "patient": { "id": "...", "name": "..." },
  "visits": [ { "visit_date": "..." } ],
  "labResults": [ { "test_name": "..." } ],
  "prescriptions": [ { "medication": "..." } ],
  "latestPrediction": { "risk_score": 0.42, "high_risk_conditions": ["..."] },
  "metrics": [ { "metric_type": "heart_rate", "metric_value": 76 } ]
}
```

## IoT Metrics API (Edge Function)

Path: `supabase/functions/iotMetrics/index.ts`

- Methods: GET, POST
- Auth: Required. RLS ensures patients only access their own data; staff roles can access as per policy.
- GET query params:
  - `patient_id` (required)
  - `metric_type` (optional)
  - `from`, `to` (ISO timestamps, optional)
  - `limit`, `offset`

Example (GET):
```bash
curl -s \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$SUPABASE_FUNCTIONS_URL/iotMetrics?patient_id=<PATIENT_ID>&metric_type=heart_rate&limit=50"
```

POST body (single or array):
```json
{
  "patient_id": "<PATIENT_ID>",
  "metric_type": "heart_rate",
  "metric_value": 76,
  "metric_date": "2025-08-29T10:00:00Z" // optional
}
```

Example (POST):
```bash
curl -s -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"<PATIENT_ID>","metric_type":"heart_rate","metric_value":76}' \
  "$SUPABASE_FUNCTIONS_URL/iotMetrics"
```

## Doctor Dashboard: Assigned Patients & Predictions

- getAssignedPatients (GET)
  - Query: `search?`, `limit?`, `offset?`
  - Auth: doctor/admin
- getPrediction (POST)
  - Body: `{ patient_id: string }`
  - Env: `ML_MODEL_API` must be set (e.g., `https://ml.example.com`)

## Appointments API

- appointments (GET|POST|PATCH|DELETE)
  - GET filters: `patient_id?`, `doctor_id?`, `from?`, `to?`, `status?`, `limit?`, `offset?`
  - POST body: `{ patient_id, doctor_id, scheduled_at, reason? }`
  - PATCH body: `{ id, scheduled_at?, reason?, status?, doctor_id? }`
  - DELETE query: `id`
  - Auth: GET doctor/admin/patient; mutations doctor/admin

## Analytics API

- analytics (GET)
  - Query: `from?`, `to?`
  - Returns: `{ totals: { patients, appointments_pending }, risk_distribution: { low, medium, high }, top_conditions: [{condition, count}] }`
  - Auth: doctor/admin (doctor scope restricted to assigned patients)

## Database: patient_metrics table and RLS

Migration file: `supabase/sql/20250829_patient_metrics.sql`

- Creates `public.patient_metrics`:
  - `patient_id`, `metric_type`, `metric_value`, `metric_date`
- RLS Policies:
  - Patients can select/insert their own metrics
  - Staff (`admin`, `doctor`, `nurse`) can select/insert/update/delete

Apply migration:
```bash
# Using Supabase CLI from repo root
supabase db reset   # or: supabase db push / apply the specific SQL file
```

## SQL Migrations Added

- `supabase/sql/20250829_doctor_dashboard.sql`
- `supabase/sql/20250829_appointments_audit.sql`

Apply: `supabase db reset` or run the files in order.

## Security & Compliance
- RLS policies enforce least-privilege on all tables.
- Admin-only mutations for critical resources.
- Pass through `Authorization` header so RLS applies to function calls.
- Avoid logging PHI. Do not print sensitive data in server logs.
- Storage bucket `lab-results` is private; serve via signed URLs only.
- Use HTTPS only. Rotate keys periodically. Limit function egress as needed.

## Tables
See `supabase/sql/01_schema.sql` for definitions:
- `profiles`, `departments`, `doctors`, `staff`
- `patients`, `patient_doctor`, `medical_history`
- `lab_results`, `prescriptions`, `predictions`, `notifications`
- `patient_metrics`

## Testing
Minimal Deno tests included under each function where applicable (e.g., `patients/test.ts`).
Run locally with `deno test -A` after configuring environment.

## Local testing

Deno tests exist for the new functions and use a test auth bypass:
- Files:
  - `supabase/functions/getPatientDashboard/test.ts`
  - `supabase/functions/iotMetrics/test.ts`
- Run:
```bash
cd supabase/functions
deno test -A
```

Note: Editor typing is aided by `supabase/functions/_shared/deno-globals.d.ts` and triple-slash references in each function.

## Frontend Integration Notes

- Include the JWT in the `Authorization: Bearer <token>` header for all requests.
- Example fetch (Assigned Patients):

```ts
await fetch(`${SUPABASE_FUNCTIONS_URL}/getAssignedPatients?limit=20`, {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

- Example fetch (Get Prediction):

```ts
await fetch(`${SUPABASE_FUNCTIONS_URL}/getPrediction`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ patient_id })
});
```

- Example fetch (Appointments CRUD) and (Analytics) follow the same pattern.

Ensure env vars set:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ML_MODEL_API` for predictions
