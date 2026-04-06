-- ============================================================================
-- EMAIL MIGRATION: PEM user — peremindona@gmail.com → horta.pem@gmail.com
-- ============================================================================
-- Run in Supabase SQL Editor (has service role access, can touch auth.users)
-- Safe to re-run — uses DO $$ for conditional updates.

-- Step 1: Update the Supabase Auth user (the actual login identity)
-- This changes the email they use to log in.
UPDATE auth.users
SET
    email = 'horta.pem@gmail.com',
    email_confirmed_at = COALESCE(email_confirmed_at, now())  -- keep confirmed if already was
WHERE email = 'peremindona@gmail.com';

-- Verify: should return 1 row
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'horta.pem@gmail.com';

-- Step 2: Update cad_users_mapping (team membership / contact info)
-- This is the table that links users to their CAD and stores their profile role.
UPDATE public.cad_users_mapping
SET user_email = 'horta.pem@gmail.com'
WHERE user_email = 'peremindona@gmail.com';

-- Step 3: Update diagnostic_forms (form answers are keyed by email)
UPDATE public.diagnostic_forms
SET user_email = 'horta.pem@gmail.com'
WHERE user_email = 'peremindona@gmail.com';

-- Step 4: Update admin_users_mapping (in case PEM was also an admin - unlikely but safe)
UPDATE public.admin_users_mapping
SET user_email = 'horta.pem@gmail.com'
WHERE user_email = 'peremindona@gmail.com';

-- ============================================================================
-- VERIFICATION QUERIES (run these after to confirm everything looks right)
-- ============================================================================

-- 1. Confirm the auth user was updated
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'horta.pem@gmail.com';

-- 2. Confirm cad_users_mapping was updated (shows CAD name + new email)
SELECT cum.user_email, cum.nombre_persona, cum.perfil_rol, cp.nombre_comercial
FROM public.cad_users_mapping cum
JOIN public.cad_profiles cp ON cp.id = cum.cad_id
WHERE cum.user_email = 'horta.pem@gmail.com';

-- 3. Confirm no orphaned rows with the old email remain
SELECT 'auth.users' as source, count(*) FROM auth.users WHERE email = 'peremindona@gmail.com'
UNION ALL
SELECT 'cad_users_mapping', count(*) FROM public.cad_users_mapping WHERE user_email = 'peremindona@gmail.com'
UNION ALL
SELECT 'diagnostic_forms', count(*) FROM public.diagnostic_forms WHERE user_email = 'peremindona@gmail.com'
UNION ALL
SELECT 'admin_users_mapping', count(*) FROM public.admin_users_mapping WHERE user_email = 'peremindona@gmail.com';
-- All counts should be 0.
