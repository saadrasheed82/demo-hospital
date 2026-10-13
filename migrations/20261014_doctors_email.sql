-- Migration: give the `doctors` table an `email` so a doctor record can be
-- tied to a login in the `users` table (created by the admin on Team Logins).
-- Apply to the live project (qamnxnqkzjziqpnhlrhm) via the Supabase SQL editor or CLI.
-- Matches the rest of the schema's RLS style (allow_all) so client-side writes work.

-- Column is nullable: legacy doctors (doc1–doc5) have no login yet and are
-- "claimed" by an admin who later enters their email. UNIQUE allows multiple
-- NULLs, so unclaimed rows don't collide.
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS email text UNIQUE;
