type AuthLikeError = unknown;

function normalizeMessage(error: AuthLikeError): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message || '');
    return message;
  }
  return 'Something went wrong. Please try again.';
}

export function getAuthErrorMessage(error: AuthLikeError): string {
  const raw = normalizeMessage(error).toLowerCase();

  if (raw.includes('invalid login credentials') || raw.includes('invalid_credentials') || raw.includes('wrong email or password')) {
    return 'Incorrect email or password.';
  }

  if (raw.includes('email not confirmed') || raw.includes('email confirmation')) {
    return 'Please confirm your email before signing in.';
  }

  if (raw.includes('too_many_requests') || raw.includes('rate limit') || raw.includes('too many requests') || raw.includes('429')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (raw.includes('user already registered') || raw.includes('email exists') || raw.includes('already registered')) {
    return 'An account already exists for this email. Try signing in instead.';
  }

  if (raw.includes('password should be at least 6 characters') || raw.includes('password is too short') || raw.includes('minimum 6 characters')) {
    return 'Password must be at least 6 characters.';
  }

  if (raw.includes('missing supabase environment variables')) {
    return 'Authentication is not configured. Please check your environment variables.';
  }

  return 'Something went wrong. Please try again.';
}

export function toAuthError(error: AuthLikeError): Error {
  return new Error(getAuthErrorMessage(error));
}