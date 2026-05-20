-- Payment logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'lemonsqueezy')),
  payment_id TEXT,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_provider ON payment_logs(provider);

-- Ensure users table has plan column (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'plan'
  ) THEN
    ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro'));
  END IF;
END $$;

-- RLS for payment_logs
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment logs
CREATE POLICY "Users can view own payment logs" ON payment_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhook handlers)
CREATE POLICY "Service role can manage payment logs" ON payment_logs
  FOR ALL USING (auth.role() = 'service_role');
