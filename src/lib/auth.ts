import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long'
);

/**
 * Get the current user from the JWT token in cookies
 * Only works in Server Components and Route Handlers
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) return null;

    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get user ID from auth context
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return (user?.sub as string) || null;
}
