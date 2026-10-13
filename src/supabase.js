import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseActive = !!supabaseUrl && !!supabaseAnonKey
// Only construct the client when configured; every caller checks
// isSupabaseActive first, so a null client is never touched in demo mode.
// supabase-js throws on an empty URL, so createClient must be guarded.
export const supabase = isSupabaseActive ? createClient(supabaseUrl, supabaseAnonKey) : null
