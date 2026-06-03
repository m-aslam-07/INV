-- ============================================================================
-- Full invoice schema reconciliation
-- Adds every invoice column referenced by the app and backfills from invoice_json.
-- Safe to run alongside existing migrations.
-- ============================================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS template TEXT,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_data JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE invoices
SET
  invoice_number = COALESCE(NULLIF(invoice_number, ''), invoice_json->'document'->>'number', id::text),
  client_name = COALESCE(NULLIF(client_name, ''), invoice_json->'client'->>'name', ''),
  company_name = COALESCE(NULLIF(company_name, ''), invoice_json->'business'->>'name', ''),
  template = COALESCE(NULLIF(template, ''), invoice_json->'style'->>'template', ''),
  subtotal = COALESCE(subtotal, 0),
  discount_total = COALESCE(discount_total, 0),
  tax_total = COALESCE(tax_total, 0),
  total_amount = COALESCE(total_amount, 0),
  status = COALESCE(NULLIF(status, ''), invoice_json->>'status', 'draft'),
  currency = COALESCE(NULLIF(currency, ''), invoice_json->'document'->>'currency', 'INR'),
  invoice_data = COALESCE(invoice_data, invoice_json),
  updated_at = COALESCE(updated_at, now())
WHERE invoice_number IS NULL
   OR client_name IS NULL
   OR company_name IS NULL
   OR template IS NULL
   OR invoice_data IS NULL
   OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_user_created_at_reconciled
  ON invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_invoice_number_reconciled
  ON invoices (user_id, invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoices_user_status_reconciled
  ON invoices (user_id, status);
