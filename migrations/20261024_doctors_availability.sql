-- Doctor availability status: shown to patients, admin and staff.
-- 'available' is the default so existing doctors read as on duty.
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'available'
  CHECK (availability IN ('available', 'on_break', 'off_duty'));
