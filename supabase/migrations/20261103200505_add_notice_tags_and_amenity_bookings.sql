/*
# Add notice priority tags and amenity bookings

1. Modified Tables
- `notices`: new column `tag` (text, default 'general'). Allowed values are 'general', 'emergency_water_shutdown', 'agm_meeting' and 'pest_control'. The tag drives the priority colour and label on the notice board. Existing notices receive 'general'.

2. New Tables
- `amenity_bookings`: one row per reserved slot of the clubhouse or party lawn.
  - `amenity` ('clubhouse' or 'party_lawn')
  - `booking_date` (date)
  - `slot` ('morning', 'afternoon' or 'evening')
  - `resident_name`, `flat_number`, `purpose`, `guest_count`
  - A unique constraint on (amenity, booking_date, slot) prevents two residents from reserving the same slot, even when they submit at the same moment.

3. Security
- Row level security is enabled on `amenity_bookings`.
- The app has no sign-in screen, so policies target `anon` and `authenticated` with full CRUD, matching the existing tables.

4. Notes
- No columns are removed or changed. The older `category` column on `notices` stays in place and is no longer shown in the app.
*/

ALTER TABLE notices ADD COLUMN IF NOT EXISTS tag text NOT NULL DEFAULT 'general';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notices_tag_check') THEN
    ALTER TABLE notices ADD CONSTRAINT notices_tag_check
      CHECK (tag IN ('general', 'emergency_water_shutdown', 'agm_meeting', 'pest_control'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS amenity_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity text NOT NULL CHECK (amenity IN ('clubhouse', 'party_lawn')),
  booking_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('morning', 'afternoon', 'evening')),
  resident_name text NOT NULL,
  flat_number text NOT NULL,
  purpose text NOT NULL DEFAULT '',
  guest_count integer NOT NULL DEFAULT 0 CHECK (guest_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT amenity_bookings_slot_unique UNIQUE (amenity, booking_date, slot)
);

CREATE INDEX IF NOT EXISTS amenity_bookings_date_idx ON amenity_bookings (booking_date);

ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON amenity_bookings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_amenity_bookings" ON amenity_bookings;
CREATE POLICY "anon_select_amenity_bookings" ON amenity_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_amenity_bookings" ON amenity_bookings;
CREATE POLICY "anon_insert_amenity_bookings" ON amenity_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_amenity_bookings" ON amenity_bookings;
CREATE POLICY "anon_update_amenity_bookings" ON amenity_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_amenity_bookings" ON amenity_bookings;
CREATE POLICY "anon_delete_amenity_bookings" ON amenity_bookings FOR DELETE TO anon, authenticated USING (true);
