-- ============================================================================
-- EMAIL MIGRATION: Apaema — apaema@gmail.com → info@apaema.net
-- ============================================================================
-- Run in Supabase SQL Editor (has service role access, can touch auth.users)
-- Safe to re-run — all updates are idempotent (WHERE filters the old email).

-- Step 1: Update the Supabase Auth user (the actual login identity)
-- This changes the email they use to log in.
UPDATE auth.users
SET
    email = 'info@apaema.net',
    email_confirmed_at = COALESCE(email_confirmed_at, now())  -- keep confirmed if already was
WHERE email = 'apaema@gmail.com';

-- Step 2: Update cad_users_mapping (team membership / contact info)
UPDATE public.cad_users_mapping
SET user_email = 'info@apaema.net'
WHERE user_email = 'apaema@gmail.com';

-- Step 3: Update diagnostic_forms (form answers are keyed by email)
UPDATE public.diagnostic_forms
SET user_email = 'info@apaema.net'
WHERE user_email = 'apaema@gmail.com';

-- Step 4: Update admin_users_mapping (in case Apaema was also an admin — safe to run even if 0 rows)
UPDATE public.admin_users_mapping
SET user_email = 'info@apaema.net'
WHERE user_email = 'apaema@gmail.com';

-- ============================================================================
-- VERIFICATION QUERIES — run these AFTER the updates to confirm success
-- ============================================================================

-- 1. Confirm the auth user was updated (should return 1 row)
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'info@apaema.net';

-- 2. Confirm cad_users_mapping was updated (shows CAD name + new email)
SELECT cum.user_email, cum.nombre_persona, cum.perfil_rol, cp.nombre_comercial
FROM public.cad_users_mapping cum
JOIN public.cad_profiles cp ON cp.id = cum.cad_id
WHERE cum.user_email = 'info@apaema.net';

-- 3. Confirm NO orphaned rows with the old email remain (all counts must be 0)
SELECT 'auth.users'          AS source, count(*) FROM auth.users           WHERE email      = 'apaema@gmail.com'
UNION ALL
SELECT 'cad_users_mapping',            count(*) FROM public.cad_users_mapping WHERE user_email = 'apaema@gmail.com'
UNION ALL
SELECT 'diagnostic_forms',             count(*) FROM public.diagnostic_forms  WHERE user_email = 'apaema@gmail.com'
UNION ALL
SELECT 'admin_users_mapping',          count(*) FROM public.admin_users_mapping WHERE user_email = 'apaema@gmail.com';
-- ✅ All four counts should be 0.
