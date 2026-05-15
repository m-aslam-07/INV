import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Client-side Supabase client (browser)
export const createSupabaseClient = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

// Browser instance
export const supabase = createSupabaseClient();
