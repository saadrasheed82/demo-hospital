import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  test: {
    // Tests must run in demo mode, never against the live project.
    // vitest auto-loads .env, which would set real Supabase credentials and
    // make tests write to the live database. Blank out the VITE_ vars so
    // isSupabaseActive is always false under test.
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
    },
  },
})
