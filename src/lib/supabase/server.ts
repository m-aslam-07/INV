import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Server-side Supabase client (backend)
export const createSupabaseServer = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Admin client for server-side operations
export const supabaseAdmin = createSupabaseServer();
