// Auth utilities (client-side Vite-compatible)
// The old file used jose + next/headers which don't work in Vite

import { supabase } from './supabase/client';

/**
 * Get the current authenticated user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Get current user's email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email ?? null;
  } catch {
    return null;
  }
}
