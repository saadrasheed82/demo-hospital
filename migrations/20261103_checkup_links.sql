-- Migration: link a checkup across tokens, appointments and consult notes, and
-- record when the checkup started and ended.
--
-- Before this, a consult note was reachable only by (doctor_id, token): it had
-- no patient_id, appointments had no token_id, and consult_notes.appointment_id
-- was never populated. That made "show this patient their checkup" impossible
-- for a patient who booked twice in a day.
--
-- tokens.started_at already existed but nothing wrote it; ended_at is new.

-- ── 1. Columns ──────────────────────────────────────────────────────────────
ALTER TABLE public.tokens ADD COLUMN IF NOT EXISTS ended_at timestamptz;
ALTER TABLE public.consult_notes ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS token_id text;

-- ── 2. Backfill: appointment → its token ────────────────────────────────────
-- A booking creates its appointment and its token within the same second, so
-- the nearest token for the same patient and doctor is the right one.
UPDATE public.appointments a
SET token_id = m.tok_id
FROM (
  SELECT DISTINCT ON (a2.id) a2.id AS apt_id, t2.id AS tok_id
  FROM public.appointments a2
  JOIN public.tokens t2
    ON t2.patient_id = a2.patient_id
   AND t2.doctor_id = a2.doctor_id
  WHERE a2.token_id IS NULL
  ORDER BY a2.id, abs(extract(epoch FROM (t2.created_at - a2.created_at)))
) m
WHERE a.id = m.apt_id;

-- ── 3. Backfill: consult note → its patient ─────────────────────────────────
-- (doctor_id, token) is unique within a doctor's queue, so this is exact.
UPDATE public.consult_notes c
SET patient_id = t.patient_id
FROM public.tokens t
WHERE t.doctor_id = c.doctor_id
  AND t.token = c.token
  AND c.patient_id IS NULL;

-- ── 4. Backfill: consult note → its appointment ─────────────────────────────
UPDATE public.consult_notes c
SET appointment_id = a.id
FROM public.appointments a
JOIN public.tokens t ON t.id = a.token_id
WHERE t.doctor_id = c.doctor_id
  AND t.token = c.token
  AND t.patient_id = c.patient_id
  AND c.appointment_id IS NULL;
