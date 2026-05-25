import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useInvoiceStore } from './useInvoiceStore';
import {
  getCompanyProfile,
  saveCompanyProfile,
  uploadLogo,
} from '../lib/storage';
import type { CompanyProfile } from '../lib/types';

interface UseCompanyProfileReturn {
  /** The loaded company profile (null if not found) */
  profile: CompanyProfile | null;
  /** Load company profile from storage */
  loadProfile: () => Promise<CompanyProfile | null>;
  /** Save current business fields as company profile */
  saveProfile: () => Promise<boolean>;
  /** Upload a logo file and return the URL */
  uploadLogoFile: (file: File) => Promise<string | null>;
  /** Auto-fill the invoice form with saved company profile */
  autoFill: () => void;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Hook for managing company profiles.
 * Pro users: Supabase persistence + auto-fill on login.
 * Free users: localStorage persistence.
 */
export function useCompanyProfile(): UseCompanyProfileReturn {
  const { isPro, user } = useAuthStore();
  const invoiceStore = useInvoiceStore();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const autoFillDoneRef = useRef(false);

  const userId = isPro && user ? user.id : undefined;

  const loadProfile = useCallback(async (): Promise<CompanyProfile | null> => {
    if (loadedRef.current && profile) return profile;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyProfile(userId);
      setProfile(data);
      loadedRef.current = true;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      setError(msg);
      console.error('[useCompanyProfile.loadProfile]', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, profile]);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const biz = useInvoiceStore.getState().business;
      const profileData: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId || 'local',
        company_name: biz.name,
        email: '',
        phone: '',
        address: biz.address1,
        city: '',
        state: '',
        pin: '',
        gstin: biz.gstin,
        pan: '',
        logo_url: biz.logoUrl,
      };

      const saved = await saveCompanyProfile(profileData, userId);
      if (saved) setProfile(saved);
      return !!saved;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setError(msg);
      console.error('[useCompanyProfile.saveProfile]', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const uploadLogoFile = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = await uploadLogo(file, userId);
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(msg);
      console.error('[useCompanyProfile.uploadLogo]', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /** Fill the invoice form's business section from the saved company profile */
  const autoFill = useCallback(() => {
    if (!profile) return;
    invoiceStore.updateBusiness({
      name: profile.company_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address1: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      pin: profile.pin || '',
      gstin: profile.gstin || '',
      pan: profile.pan || '',
      logoUrl: profile.logo_url || null,
    });
  }, [profile, invoiceStore]);

  // Auto-load and auto-fill profile for Pro users on mount
  useEffect(() => {
    if (!userId || autoFillDoneRef.current) return;

    const doAutoFill = async () => {
      const loaded = await loadProfile();
      if (loaded && !autoFillDoneRef.current) {
        // Only auto-fill if business name is still empty (user hasn't started editing)
        const currentBiz = useInvoiceStore.getState().business;
        if (!currentBiz.name) {
          invoiceStore.updateBusiness({
            name: loaded.company_name || '',
            email: loaded.email || '',
            phone: loaded.phone || '',
            address1: loaded.address || '',
            city: loaded.city || '',
            state: loaded.state || '',
            pin: loaded.pin || '',
            gstin: loaded.gstin || '',
            pan: loaded.pan || '',
            logoUrl: loaded.logo_url || null,
          });
        }
        autoFillDoneRef.current = true;
      }
    };

    doAutoFill();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile,
    loadProfile,
    saveProfile,
    uploadLogoFile,
    autoFill,
    loading,
    error,
  };
}
