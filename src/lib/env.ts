// Environment configuration for Vite client-side app
// Server-side secrets (RAZORPAY_KEY_SECRET, LEMONSQUEEZY_API_KEY, etc.)
// are only used in Vercel serverless functions, NOT in browser code.

export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  LEMONSQUEEZY_STORE_ID: import.meta.env.VITE_LEMONSQUEEZY_STORE_ID || '',
  APP_URL: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),
  IS_DEV: import.meta.env.DEV,
};
