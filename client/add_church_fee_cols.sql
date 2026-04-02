ALTER TABLE churches ADD COLUMN IF NOT EXISTS church_fee_payment_url TEXT; ALTER TABLE churches ADD COLUMN IF NOT EXISTS church_fee_status VARCHAR(50) DEFAULT 'Pending';
