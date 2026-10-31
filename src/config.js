// Runtime build-mode flags. `VITE_APP_MODE=patient` produces a patient-only
// Android build (see package.json "build:android"); the normal web build is
// unset and keeps every role.
export const isPatientOnly = import.meta.env.VITE_APP_MODE === 'patient'

// The patient-only build rejects any non-patient account, even with correct
// credentials. Returns an error message to surface, or null when allowed.
export const patientOnlyGuard = (role, patientOnly = isPatientOnly) => {
  if (patientOnly && role !== 'patient') {
    return 'This app is for patients only. Staff and doctors use the hospital web app.'
  }
  return null
}
