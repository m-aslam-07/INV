DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_invoices_user_id_invoice_number'
    ) THEN
        -- De-duplicate existing rows with duplicate user_id + invoice_number
        -- by appending a suffix based on creation order
        WITH duplicates AS (
          SELECT id,
                 invoice_number,
                 row_number() OVER (PARTITION BY user_id, invoice_number ORDER BY created_at ASC) as rn
          FROM invoices
          WHERE invoice_number IS NOT NULL AND user_id IS NOT NULL
        )
        UPDATE invoices i
        SET invoice_number = i.invoice_number || '-' || d.rn
        FROM duplicates d
        WHERE i.id = d.id AND d.rn > 1;

        -- Add the unique constraint
        ALTER TABLE invoices
          ADD CONSTRAINT uq_invoices_user_id_invoice_number UNIQUE(user_id, invoice_number);
    END IF;
END $$;
