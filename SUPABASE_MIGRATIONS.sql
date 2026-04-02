-- ============================================================
-- CapBYFU-webapp Feature Migrations
-- Run these in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- [1] Add staff_discount_fee to churches table
--     Null = no discount (uses registration_fee)
ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS staff_discount_fee INTEGER DEFAULT NULL;

-- [2] Add consent_template_url to app_settings table
ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS consent_template_url TEXT DEFAULT NULL;

-- [3] Create RPC for Forgot Password (Visiting Churches)
--     Allows resetting a visiting church password by church name.
--     Security: only visiting churches can reset; uses the same bcrypt hashing
--     as register_or_login_visiting_church.
CREATE OR REPLACE FUNCTION reset_visiting_church_password(
  p_name TEXT,
  p_new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_church_id UUID;
  v_hashed TEXT;
BEGIN
  -- Find the visiting church
  SELECT id INTO v_church_id
  FROM churches
  WHERE name = p_name AND circuit = 'Visiting'
  LIMIT 1;

  IF v_church_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Visiting church not found.');
  END IF;

  -- Hash the new password using pgcrypto
  v_hashed := crypt(p_new_password, gen_salt('bf'));

  -- Update the password
  UPDATE churches
  SET password_hash = v_hashed
  WHERE id = v_church_id;

  RETURN json_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- [4] Ensure consent-forms storage bucket exists and is public
--     Run this if the bucket doesn't exist yet.
--     (You can also create it via Supabase Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('consent-forms', 'consent-forms', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access on consent-forms bucket
DROP POLICY IF EXISTS "Public read consent-forms" ON storage.objects;
CREATE POLICY "Public read consent-forms"
ON storage.objects FOR SELECT
USING (bucket_id = 'consent-forms');

-- Allow authenticated uploads to consent-forms
DROP POLICY IF EXISTS "Anon upload consent-forms" ON storage.objects;
CREATE POLICY "Anon upload consent-forms"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'consent-forms');

-- [5] Update Payment Method Constraint to allow 'Free' and uppercase variants
--     If you previously created a CHECK constraint for payment_method, 
--     you must drop it and recreate it so "Free" delegates can be saved.
ALTER TABLE delegates DROP CONSTRAINT IF EXISTS delegates_payment_method_check;
ALTER TABLE delegates ADD CONSTRAINT delegates_payment_method_check 
  CHECK (payment_method IN ('cash', 'gcash', 'paymaya', 'gotyme', 'Cash', 'GCash', 'PayMaya', 'GoTyme', 'Free', 'free', 'N/A'));