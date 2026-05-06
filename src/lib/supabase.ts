import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('MISSING_ENV_VAR: VITE_SUPABASE_URL is required to initialize Supabase.');
}

if (!supabaseAnonKey) {
  throw new Error('MISSING_ENV_VAR: VITE_SUPABASE_ANON_KEY is required to initialize Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
