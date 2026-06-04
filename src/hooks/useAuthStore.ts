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
  subscriptionStatus: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
}

let authListenerCleanup: (() => void) | null = null;
let initializePromise: Promise<(() => void) | null> | null = null;

export interface SubscriptionStatusInfo {
  plan?: string | null;
  subscription_status?: string | null;
  subscription_end?: string | null;
}

export function isProUser(info: SubscriptionStatusInfo | null | undefined): boolean {
  if (!info) return false;
  if (info.plan !== 'pro') return false;
  if (info.subscription_status !== 'active') return false;
  if (!info.subscription_end) return false;
  return new Date(info.subscription_end).getTime() > Date.now();
}

export function isSubscriptionActive(info: SubscriptionStatusInfo | null | undefined): boolean {
  if (!info) return false;
  if (info.subscription_status !== 'active') return false;
  if (!info.subscription_end) return false;
  return new Date(info.subscription_end).getTime() > Date.now();
}

export function hasExpiredSubscription(info: SubscriptionStatusInfo | null | undefined): boolean {
  if (!info) return false;
  if (info.subscription_status === 'expired') return true;
  if (!info.subscription_end) return false;
  return new Date(info.subscription_end).getTime() <= Date.now();
}

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

interface UserSubscriptionData {
  plan: AccountPlan;
  subscription_status: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
}

async function checkAndFetchUserPlan(userId: string): Promise<UserSubscriptionData> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('No authenticated session token');
  }

  const response = await fetch('/api/payment/check-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to verify subscription on server');
  }

  const result = await response.json();

  console.log('[subscription] Current plan:', result.plan);
  console.log('[subscription] Current subscription_status:', result.subscription_status);
  console.log('[subscription] subscription_start:', result.subscription_start);
  console.log('[subscription] subscription_end:', result.subscription_end);

  const isExpired = result.subscription_end && result.plan === 'free' && result.subscription_status === 'expired';
  console.log('[subscription] Expiration check result: isExpired =', isExpired);

  return {
    plan: result.plan as AccountPlan,
    subscription_status: result.subscription_status,
    subscription_start: result.subscription_start,
    subscription_end: result.subscription_end,
  };
}

async function upsertFreeUser(user: AuthUser): Promise<void> {
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    plan: 'free',
  }, { onConflict: 'id' });
}

async function syncAuthSession(sessionUser: { id: string; email: string } | null): Promise<AuthListenerPayload> {
  if (!sessionUser) {
    return {
      user: null,
      plan: 'guest',
      isPro: false,
      subscriptionStatus: null,
      subscriptionStart: null,
      subscriptionEnd: null,
    };
  }

  const user: AuthUser = { id: sessionUser.id, email: sessionUser.email };
  let plan: AccountPlan = 'free';
  let subscriptionStatus: string | null = null;
  let subscriptionStart: string | null = null;
  let subscriptionEnd: string | null = null;

  try {
    const sub = await checkAndFetchUserPlan(user.id);
    plan = sub.plan;
    subscriptionStatus = sub.subscription_status;
    subscriptionStart = sub.subscription_start;
    subscriptionEnd = sub.subscription_end;
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

  const isPro = plan === 'pro' &&
                subscriptionStatus === 'active' &&
                (subscriptionEnd ? new Date(subscriptionEnd).getTime() > Date.now() : false);

  return {
    user,
    plan,
    isPro,
    subscriptionStatus,
    subscriptionStart,
    subscriptionEnd,
  };
}

interface AuthState {
  user: AuthUser | null;
  plan: AccountPlan;
  isPro: boolean;
  subscriptionStatus: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
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
  subscriptionStatus: null,
  subscriptionStart: null,
  subscriptionEnd: null,
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
        subscriptionStatus: synced.subscriptionStatus,
        subscriptionStart: synced.subscriptionStart,
        subscriptionEnd: synced.subscriptionEnd,
        loading: false,
      });
    } catch (error) {
      console.error('Auth signIn error:', error);
      const message = getAuthErrorMessage(error);
      const devMessage = import.meta.env.DEV ? `Debug: ${JSON.stringify(error)}` : message;
      set({
        error: devMessage,
        loading: false,
        user: null,
        plan: 'guest',
        isPro: false,
        subscriptionStatus: null,
        subscriptionStart: null,
        subscriptionEnd: null,
      });
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

      const needsConfirmation = !data.session;

      if (data.session && data.user) {
        await upsertFreeUser({ id: data.user.id, email: data.user.email! });
        syncCloudMode('free');
        set({
          user: { id: data.user.id, email: data.user.email! },
          plan: 'free',
          isPro: false,
          subscriptionStatus: null,
          subscriptionStart: null,
          subscriptionEnd: null,
          loading: false,
        });
      }

      return { needsConfirmation };
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({
        error: message,
        loading: false,
        user: null,
        plan: 'guest',
        isPro: false,
        subscriptionStatus: null,
        subscriptionStart: null,
        subscriptionEnd: null,
      });
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
            subscriptionStatus: synced.subscriptionStatus,
            subscriptionStart: synced.subscriptionStart,
            subscriptionEnd: synced.subscriptionEnd,
            loading: false,
          });
        } else {
          syncCloudMode('guest');
          set({
            user: null,
            plan: 'guest',
            isPro: false,
            subscriptionStatus: null,
            subscriptionStart: null,
            subscriptionEnd: null,
            loading: false,
          });
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
                subscriptionStatus: synced.subscriptionStatus,
                subscriptionStart: synced.subscriptionStart,
                subscriptionEnd: synced.subscriptionEnd,
              });
            } else {
              syncCloudMode('guest');
              set({
                user: null,
                plan: 'guest',
                isPro: false,
                subscriptionStatus: null,
                subscriptionStart: null,
                subscriptionEnd: null,
              });
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
        set({
          error: message,
          user: null,
          plan: 'guest',
          isPro: false,
          subscriptionStatus: null,
          subscriptionStart: null,
          subscriptionEnd: null,
          loading: false,
        });
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
      set({
        user: null,
        plan: 'guest',
        isPro: false,
        subscriptionStatus: null,
        subscriptionStart: null,
        subscriptionEnd: null,
        loading: false,
      });
    }
  },

  refreshPlan: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const sub = await checkAndFetchUserPlan(user.id);
      syncCloudMode(sub.plan);
      const isPro = sub.plan === 'pro' &&
                    sub.subscription_status === 'active' &&
                    (sub.subscription_end ? new Date(sub.subscription_end).getTime() > Date.now() : false);
      set({
        plan: sub.plan,
        isPro,
        subscriptionStatus: sub.subscription_status,
        subscriptionStart: sub.subscription_start,
        subscriptionEnd: sub.subscription_end,
      });
    } catch (error) {
      console.error('Failed to refresh plan:', error);
    }
  },
}));
