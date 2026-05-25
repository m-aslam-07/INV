-- ================================================================
-- Security hardening: entitlement + RLS enforcement
-- ================================================================

-- Helper: current user must be Pro for cloud PRO features.
CREATE OR REPLACE FUNCTION public.is_current_user_pro()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.plan = 'pro'
  );
$$;

-- ----------------------------------------------------------------
-- USERS TABLE POLICY HARDENING
-- ----------------------------------------------------------------

-- Prevent clients from self-escalating plan via direct update.
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can update own non-plan profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT u.plan FROM users u WHERE u.id = auth.uid())
  );

-- Ensure authenticated users can create their own row only as free.
DROP POLICY IF EXISTS "Users can insert own free profile" ON users;
CREATE POLICY "Users can insert own free profile"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND plan = 'free'
  );

-- ----------------------------------------------------------------
-- PRO-ONLY CLOUD TABLE RLS
-- ----------------------------------------------------------------

-- Company profiles
DROP POLICY IF EXISTS "Users can view their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can create their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can delete their own company profile" ON company_profiles;

CREATE POLICY "Pro users can read own company profile"
  ON company_profiles FOR SELECT
  USING (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can insert own company profile"
  ON company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can update own company profile"
  ON company_profiles FOR UPDATE
  USING (auth.uid() = user_id AND public.is_current_user_pro())
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can delete own company profile"
  ON company_profiles FOR DELETE
  USING (auth.uid() = user_id AND public.is_current_user_pro());

-- Invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

CREATE POLICY "Pro users can read own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id AND public.is_current_user_pro())
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can delete own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id AND public.is_current_user_pro());

-- Saved templates
DROP POLICY IF EXISTS "Users can view their own templates" ON saved_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON saved_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON saved_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON saved_templates;

CREATE POLICY "Pro users can read own templates"
  ON saved_templates FOR SELECT
  USING (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can insert own templates"
  ON saved_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can update own templates"
  ON saved_templates FOR UPDATE
  USING (auth.uid() = user_id AND public.is_current_user_pro())
  WITH CHECK (auth.uid() = user_id AND public.is_current_user_pro());

CREATE POLICY "Pro users can delete own templates"
  ON saved_templates FOR DELETE
  USING (auth.uid() = user_id AND public.is_current_user_pro());

-- ----------------------------------------------------------------
-- STORAGE OBJECTS (PRO-ONLY LOGO STORAGE)
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "Users can upload their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view any logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;

CREATE POLICY "Pro users can upload own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND public.is_current_user_pro()
  );

CREATE POLICY "Pro users can read own logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND public.is_current_user_pro()
  );

CREATE POLICY "Pro users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND public.is_current_user_pro()
  );
