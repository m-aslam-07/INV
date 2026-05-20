import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isPro: boolean;
  loading: boolean;
  loginModalOpen: boolean;
  upgradeModalOpen: boolean;
  upgradeFeature: string;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openUpgradeModal: (feature: string) => void;
  closeUpgradeModal: () => void;
  setUser: (user: AuthUser | null) => void;
  setIsPro: (isPro: boolean) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isPro: false,
  loading: true,
  loginModalOpen: false,
  upgradeModalOpen: false,
  upgradeFeature: '',

  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openUpgradeModal: (feature: string) => set({ upgradeModalOpen: true, upgradeFeature: feature }),
  closeUpgradeModal: () => set({ upgradeModalOpen: false, upgradeFeature: '' }),
  setUser: (user) => set({ user }),
  setIsPro: (isPro: boolean) => set({ isPro }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, pass: string) => {
    // MOCK LOGIN for demo PRO account
    if (email === 'pro1232@gmail.com' && pass === 'proaccount123') {
      set({
        user: { id: 'mock-pro-id-1234', email: 'pro1232@gmail.com' },
        isPro: true,
        loading: false
      });
      localStorage.setItem('sk_mock_user', 'pro');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL) {
      throw new Error("Supabase is not configured. Use the demo account to test PRO features.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    if (data.user) {
      // Fetch plan after sign-in
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('id', data.user.id)
        .single();

      set({
        user: { id: data.user.id, email: data.user.email! },
        isPro: userData?.plan === 'pro',
        loading: false,
      });
    }
  },

  signUp: async (email: string, pass: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      throw new Error("Supabase is not configured. Use the demo account to test PRO features.");
    }

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
      // Auto-create user record in users table
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        plan: 'free',
      }, { onConflict: 'id' });

      set({
        user: { id: data.user.id, email: data.user.email! },
        isPro: false,
        loading: false,
      });
    }

    return { needsConfirmation };
  },

  initializeAuth: async () => {
    set({ loading: true });
    
    // Check mock session
    if (localStorage.getItem('sk_mock_user') === 'pro') {
      set({
        user: { id: 'mock-pro-id-1234', email: 'pro1232@gmail.com' },
        isPro: true,
        loading: false
      });
      return;
    }

    // Check if Supabase is actually configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.warn("Supabase not configured. Bypassing auth check.");
      set({ user: null, isPro: false, loading: false });
      return;
    }

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Check user plan
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('plan')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') throw userError;

        set({ 
          user: { id: session.user.id, email: session.user.email! },
          isPro: userData?.plan === 'pro',
          loading: false 
        });
      } else {
        set({ user: null, isPro: false, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('plan')
            .eq('id', session.user.id)
            .single();

          set({ 
            user: { id: session.user.id, email: session.user.email! },
            isPro: userData?.plan === 'pro',
          });
        } else {
          set({ user: null, isPro: false });
        }
      });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({ user: null, isPro: false, loading: false });
    }
  },

  signOut: async () => {
    if (localStorage.getItem('sk_mock_user')) {
      localStorage.removeItem('sk_mock_user');
      set({ user: null, isPro: false });
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out failed", e);
    } finally {
      set({ user: null, isPro: false });
    }
  },

  // Refresh user plan (call after successful payment)
  refreshPlan: async () => {
    const { user } = get();
    if (!user || user.id === 'mock-pro-id-1234') return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (userData) {
        set({ isPro: userData.plan === 'pro' });
      }
    } catch (error) {
      console.error('Failed to refresh plan:', error);
    }
  },
}));
