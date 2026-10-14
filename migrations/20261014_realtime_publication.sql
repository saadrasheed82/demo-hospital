-- Migration: register the app's tables in the `supabase_realtime` publication.
--
-- Without this, Supabase's realtime `postgres_changes` events are never emitted
-- for these tables, so any client that subscribes (doctor queue, admin pages,
-- staff, etc.) silently stops refreshing after its initial load. The most
-- visible symptom is the doctor "Next Patient" button: the status updates DO
-- land in the database, but the screen stays frozen on the last patient.
--
-- Supabase ships projects with the publication containing no app tables, so
-- every new project needs this. Apply to the live project
-- (qamnxnqkzjziqpnhlrhm) via the Supabase SQL editor or CLI.

DO $$
DECLARE
  t text;
  ts text[] := ARRAY[
    'public.tokens',
    'public.doctors',
    'public.staff',
    'public.patients',
    'public.schedules',
    'public.consult_notes'
  ];
BEGIN
  FOREACH t IN ARRAY ts LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = split_part(t, '.', 1)
        AND tablename = split_part(t, '.', 2)
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s', t);
    END IF;
  END LOOP;
END $$;
