-- ================================================================
-- Invoice history normalization
-- Adds summary columns so PRO users can load, sort, and dedupe cloud invoices.
-- ================================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS template TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS invoice_data JSONB,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

UPDATE invoices
SET
  template = COALESCE(NULLIF(template, ''), invoice_json->'style'->>'template', ''),
  invoice_number = COALESCE(NULLIF(invoice_number, ''), invoice_json->'document'->>'number', id::text),
  client_name = COALESCE(NULLIF(client_name, ''), invoice_json->'client'->>'name', ''),
  company_name = COALESCE(NULLIF(company_name, ''), invoice_json->'business'->>'name', ''),
  invoice_data = COALESCE(invoice_data, invoice_json),
  currency = COALESCE(NULLIF(currency, ''), invoice_json->'document'->>'currency', 'INR'),
  subtotal = COALESCE(subtotal, 0),
  discount_total = COALESCE(discount_total, 0),
  tax_total = COALESCE(tax_total, 0),
  total_amount = COALESCE(total_amount, 0),
  updated_at = COALESCE(updated_at, now())
WHERE invoice_number IS NULL
   OR template IS NULL
   OR client_name IS NULL
   OR company_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_user_invoice_created_at
  ON invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_invoice_number
  ON invoices (user_id, invoice_number);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND indexname = 'idx_invoices_user_invoice_number_unique'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM invoices a
      JOIN invoices b
        ON a.user_id = b.user_id
       AND a.invoice_number = b.invoice_number
       AND a.id <> b.id
      LIMIT 1
    ) THEN
      EXECUTE 'CREATE UNIQUE INDEX idx_invoices_user_invoice_number_unique ON invoices (user_id, invoice_number)';
    END IF;
  END IF;
END $$;
