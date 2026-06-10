import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/** Service-role client — server only, bypasses RLS */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/** Anon client — used for sign-in / refresh (Supabase Auth API) */
export const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
