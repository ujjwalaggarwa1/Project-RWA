/*
# Create society dashboard tables

1. New Tables
- `residents`: one row per flat in the society. Holds the resident name, flat number (unique), phone and email.
- `notices`: notice board posts with title, body, category, pinned flag and creation time.
- `maintenance_dues`: one row per flat per billing month with amount, status (pending or paid) and payment date.
- `complaints`: facility complaints raised by residents with category, description, status and resolution time.

2. Security
- Row level security is enabled on every table.
- The app has no sign-in screen, so policies target the `anon` and `authenticated` roles with full CRUD on the shared society data.

3. Notes
- Foreign keys: maintenance_dues.resident_id references residents.id and cascades on delete.
- Checks restrict category, status and amount values to valid options.
*/

CREATE TABLE IF NOT EXISTS residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  flat_number text NOT NULL UNIQUE,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'event', 'urgent')),
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_dues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  billing_month date NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resident_id, billing_month)
);

CREATE INDEX IF NOT EXISTS maintenance_dues_billing_month_idx ON maintenance_dues (billing_month);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_number text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('plumbing', 'electrical', 'housekeeping', 'security', 'lift', 'parking', 'other')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints (status);

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON residents, notices, maintenance_dues, complaints TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_residents" ON residents;
CREATE POLICY "anon_select_residents" ON residents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_residents" ON residents;
CREATE POLICY "anon_insert_residents" ON residents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_residents" ON residents;
CREATE POLICY "anon_update_residents" ON residents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_residents" ON residents;
CREATE POLICY "anon_delete_residents" ON residents FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_notices" ON notices;
CREATE POLICY "anon_select_notices" ON notices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notices" ON notices;
CREATE POLICY "anon_insert_notices" ON notices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notices" ON notices;
CREATE POLICY "anon_update_notices" ON notices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notices" ON notices;
CREATE POLICY "anon_delete_notices" ON notices FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_maintenance_dues" ON maintenance_dues;
CREATE POLICY "anon_select_maintenance_dues" ON maintenance_dues FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_maintenance_dues" ON maintenance_dues;
CREATE POLICY "anon_insert_maintenance_dues" ON maintenance_dues FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_maintenance_dues" ON maintenance_dues;
CREATE POLICY "anon_update_maintenance_dues" ON maintenance_dues FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_maintenance_dues" ON maintenance_dues;
CREATE POLICY "anon_delete_maintenance_dues" ON maintenance_dues FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE TO anon, authenticated USING (true);
