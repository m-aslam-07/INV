import { create } from 'zustand';
import { getAuthErrorMessage, toAuthError } from '../lib/authErrors';
import { supabase } from '../lib/supabase/client';

interface AuthUser {
  id: string;
  email: string;
}

type AccountPlan = 'guest' | 'free' | 'pro';

interface AuthListenerPayload {
  user: AuthUser | null;
  plan: AccountPlan;
  isPro: boolean;
}

let authListenerCleanup: (() => void) | null = null;
let initializePromise: Promise<(() => void) | null> | null = null;

function syncCloudMode(plan: AccountPlan): void {
  try {
    if (plan === 'pro') {
      localStorage.setItem('sk_cloud_mode', '1');
      localStorage.removeItem('sk_draft');
      return;
    }

    localStorage.removeItem('sk_cloud_mode');
  } catch {
    // no-op (localStorage unavailable)
  }
}

async function fetchUserPlan(userId: string): Promise<AccountPlan> {
  const { data, error } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.plan === 'pro' ? 'pro' : 'free';
}

async function upsertFreeUser(user: AuthUser): Promise<void> {
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    plan: 'free',
    payment_provider: null,
    subscription_id: null,
    subscription_status: 'inactive',
  }, { onConflict: 'id' });
}

async function syncAuthSession(sessionUser: { id: string; email: string } | null): Promise<AuthListenerPayload> {
  if (!sessionUser) {
    return { user: null, plan: 'guest', isPro: false };
  }

  const user: AuthUser = { id: sessionUser.id, email: sessionUser.email };
  let plan: AccountPlan = 'free';

  try {
    plan = await fetchUserPlan(user.id);
  } catch (error) {
    console.warn('Failed to fetch user plan, defaulting to free:', error);
  }

  if (plan === 'free') {
    // Ensure a minimal profile row exists for signed-in free users.
    try {
      await upsertFreeUser(user);
    } catch (error) {
      console.warn('Failed to upsert free user profile:', error);
    }
  }

  return { user, plan, isPro: plan === 'pro' };
}

interface AuthState {
  user: AuthUser | null;
  plan: AccountPlan;
  isPro: boolean;
  loading: boolean;
  error: string | null;
  loginModalOpen: boolean;
  upgradeModalOpen: boolean;
  upgradeFeature: string;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openUpgradeModal: (feature: string) => void;
  closeUpgradeModal: () => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  initializeAuth: () => Promise<(() => void) | null>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  plan: 'guest',
  isPro: false,
  loading: true,
  error: null,
  loginModalOpen: false,
  upgradeModalOpen: false,
  upgradeFeature: '',

  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openUpgradeModal: (feature: string) => set({ upgradeModalOpen: true, upgradeFeature: feature }),
  closeUpgradeModal: () => set({ upgradeModalOpen: false, upgradeFeature: '' }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearError: () => set({ error: null }),

  signIn: async (email: string, pass: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      const sessionUser = data.user;
      const synced = await syncAuthSession(sessionUser ? { id: sessionUser.id, email: sessionUser.email! } : null);
      syncCloudMode(synced.plan);
      set({
        user: synced.user,
        plan: synced.plan,
        isPro: synced.isPro,
        loading: false,
      });
    } catch (error) {
      // Log full error for debugging (includes Supabase response)
      // Keep user-facing message concise but store raw error in console
      console.error('Auth signIn error:', error);
      const message = getAuthErrorMessage(error);
      // In development, expose raw error for diagnostics
      const devMessage = import.meta.env.DEV ? `Debug: ${JSON.stringify(error)}` : message;
      set({ error: devMessage, loading: false, user: null, plan: 'guest', isPro: false });
      throw toAuthError(error);
    }
  },

  signUp: async (email: string, pass: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw error;

      // If email confirmation is required, user won't be fully signed in yet
      const needsConfirmation = !data.session;

      if (data.session && data.user) {
        await upsertFreeUser({ id: data.user.id, email: data.user.email! });
        syncCloudMode('free');
        set({
          user: { id: data.user.id, email: data.user.email! },
          plan: 'free',
          isPro: false,
          loading: false,
        });
      }

      return { needsConfirmation };
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ error: message, loading: false, user: null, plan: 'guest', isPro: false });
      throw toAuthError(error);
    }
  },

  initializeAuth: async () => {
    if (initializePromise) return initializePromise;

    set({ loading: true, error: null });

    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const synced = await syncAuthSession({ id: session.user.id, email: session.user.email! });
          syncCloudMode(synced.plan);
          set({
            user: synced.user,
            plan: synced.plan,
            isPro: synced.isPro,
            loading: false,
          });
        } else {
          syncCloudMode('guest');
          set({ user: null, plan: 'guest', isPro: false, loading: false });
        }

        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          try {
            if (session?.user) {
              const synced = await syncAuthSession({ id: session.user.id, email: session.user.email! });
              syncCloudMode(synced.plan);
              set({
                user: synced.user,
                plan: synced.plan,
                isPro: synced.isPro,
              });
            } else {
              syncCloudMode('guest');
              set({ user: null, plan: 'guest', isPro: false });
            }
          } catch (error) {
            console.error('Auth state listener failed:', error);
            set({ error: getAuthErrorMessage(error) });
          }
        });

        authListenerCleanup = () => {
          data.subscription.unsubscribe();
          authListenerCleanup = null;
          initializePromise = null;
        };

        return authListenerCleanup;
      } catch (error) {
        const message = getAuthErrorMessage(error);
        console.error('Auth initialization failed:', error);
        set({ error: message, user: null, plan: 'guest', isPro: false, loading: false });
        authListenerCleanup = null;
        initializePromise = null;
        return null;
      } finally {
        set({ loading: false });
      }
    };

    initializePromise = init();
    return initializePromise;
  },

  signOut: async () => {
    set({ loading: true, error: null });

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out failed", e);
    } finally {
      syncCloudMode('guest');
      set({ user: null, plan: 'guest', isPro: false, loading: false });
    }
  },

  // Refresh user plan (call after successful payment)
  refreshPlan: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const plan = await fetchUserPlan(user.id);
      syncCloudMode(plan);
      set({ plan, isPro: plan === 'pro' });
    } catch (error) {
      console.error('Failed to refresh plan:', error);
    }
  },
}));
