-- ================================================================
-- Ensure invoice_number exists for invoice history and save dedupe.
-- Safe to run even if a previous migration already added the column.
-- ================================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

UPDATE invoices
SET invoice_number = COALESCE(NULLIF(invoice_number, ''), invoice_json->'document'->>'number', id::text)
WHERE invoice_number IS NULL OR invoice_number = '';

CREATE INDEX IF NOT EXISTS idx_invoices_user_invoice_number
  ON invoices (user_id, invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoices_user_invoice_created_at
  ON invoices (user_id, created_at DESC);
