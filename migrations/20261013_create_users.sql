-- Migration: create the `users` table used as the single source of truth for logins.
-- Apply to the live project (qamnxnqkzjziqpnhlrhm) via the Supabase SQL editor or CLI.
-- Matches the rest of the schema's RLS style (allow_all) so client-side login works.

CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,   -- SHA-256 hex, computed client-side with crypto.subtle
  role text NOT NULL CHECK (role IN ('admin','staff','doctor','patient')),
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_allow_all" ON public.users;
CREATE POLICY "users_allow_all" ON public.users
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed the SINGLE admin login. Password is admin123 (SHA-256 below).
-- There is no UI path that creates another admin, so this row stays the only admin.
INSERT INTO public.users (id, email, password_hash, role, name)
VALUES ('usr_admin', 'admin@hospital.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin', 'Hospital Admin')
ON CONFLICT (id) DO NOTHING;
