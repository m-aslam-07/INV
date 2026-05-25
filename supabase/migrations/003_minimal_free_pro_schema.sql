-- ================================================================
-- Minimal FREE + PRO schema for Strikin
-- Additive migration: keeps existing tables, adds only what the app needs.
-- ================================================================

-- USERS
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'lemonsqueezy')),
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled'));

ALTER TABLE users
  ALTER COLUMN plan SET DEFAULT 'free';

-- COMPANY PROFILES
-- Keep existing compatibility columns, but add a minimal canonical GST field.
ALTER TABLE company_profiles
  ADD COLUMN IF NOT EXISTS gst TEXT;

UPDATE company_profiles
SET gst = COALESCE(gst, gstin)
WHERE gst IS NULL AND gstin IS NOT NULL;

-- SAVED TEMPLATES
-- One template per name per user to avoid duplicate writes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_templates_user_name_unique
  ON saved_templates (user_id, template_name);

-- OPTIONAL PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id
  ON company_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_user_created_at
  ON invoices (user_id, created_at DESC);

-- STORAGE BUCKET FOR LOGOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload their own logos'
  ) THEN
    CREATE POLICY "Users can upload their own logos"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'invoices'
        AND (storage.foldername(name))[1] = 'company-logos'
        AND auth.uid()::text = (storage.foldername(name))[2]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view any logo'
  ) THEN
    CREATE POLICY "Users can view any logo"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'invoices'
        AND (storage.foldername(name))[1] = 'company-logos'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete their own logos'
  ) THEN
    CREATE POLICY "Users can delete their own logos"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'invoices'
        AND (storage.foldername(name))[1] = 'company-logos'
        AND auth.uid()::text = (storage.foldername(name))[2]
      );
  END IF;
END $$;
