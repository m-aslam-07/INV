import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string } | null;
  isPro: boolean;
  loading: boolean;
  loginModalOpen: boolean;
  upgradeModalOpen: boolean;
  upgradeFeature: string;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openUpgradeModal: (feature: string) => void;
  closeUpgradeModal: () => void;
  setUser: (user: { id: string; email: string } | null) => void;
  setIsPro: (isPro: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isPro: false,
  loading: false,
  loginModalOpen: false,
  upgradeModalOpen: false,
  upgradeFeature: '',

  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openUpgradeModal: (feature: string) => set({ upgradeModalOpen: true, upgradeFeature: feature }),
  closeUpgradeModal: () => set({ upgradeModalOpen: false, upgradeFeature: '' }),
  setUser: (user) => set({ user }),
  setIsPro: (isPro) => set({ isPro }),
  setLoading: (loading) => set({ loading }),
}));
