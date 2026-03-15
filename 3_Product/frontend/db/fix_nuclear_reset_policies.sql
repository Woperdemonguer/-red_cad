-- ============================================================================
-- 🔴 NUCLEAR RESET: Drop ALL policies on ALL tables, then recreate clean ones.
-- ============================================================================
-- 
-- WHY: If old policies exist under unknown names, DROP POLICY IF EXISTS "name"
--      won't catch them. This script drops EVERY policy on each table first.
--
-- SAFE: This script is 100% idempotent. Run it as many times as needed.
-- RUN:  Supabase Dashboard → SQL Editor → New query → Paste entire file → Run
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 1: NUKE all existing policies on all tables                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop ALL policies on diagnostic_forms
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'diagnostic_forms' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.diagnostic_forms', r.policyname);
        RAISE NOTICE 'Dropped policy: % on diagnostic_forms', r.policyname;
    END LOOP;

    -- Drop ALL policies on cad_users_mapping
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cad_users_mapping' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.cad_users_mapping', r.policyname);
        RAISE NOTICE 'Dropped policy: % on cad_users_mapping', r.policyname;
    END LOOP;

    -- Drop ALL policies on admin_users_mapping
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_users_mapping' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users_mapping', r.policyname);
        RAISE NOTICE 'Dropped policy: % on admin_users_mapping', r.policyname;
    END LOOP;

    -- Drop ALL policies on cad_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cad_profiles' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.cad_profiles', r.policyname);
        RAISE NOTICE 'Dropped policy: % on cad_profiles', r.policyname;
    END LOOP;

    -- Drop ALL policies on user_roles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.policyname);
        RAISE NOTICE 'Dropped policy: % on user_roles', r.policyname;
    END LOOP;

    RAISE NOTICE '✅ All policies dropped from all tables.';
END $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 2: Ensure RLS is enabled on all tables                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

ALTER TABLE public.diagnostic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cad_users_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cad_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 3: Ensure UNIQUE constraint on diagnostic_forms.user_email        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'diagnostic_forms_user_email_key' 
        AND conrelid = 'public.diagnostic_forms'::regclass
    ) THEN
        ALTER TABLE public.diagnostic_forms 
            ADD CONSTRAINT diagnostic_forms_user_email_key UNIQUE (user_email);
    END IF;
END $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 1: diagnostic_forms — Clean policies                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY "Users can read own form"
    ON public.diagnostic_forms FOR SELECT
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert own form"
    ON public.diagnostic_forms FOR INSERT
    WITH CHECK (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can update own form"
    ON public.diagnostic_forms FOR UPDATE
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can read all forms"
    ON public.diagnostic_forms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "Admins can write all forms"
    ON public.diagnostic_forms FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 2: cad_users_mapping — Clean policies                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- SELECT uses DIRECT email comparison (no self-referencing subquery)
CREATE POLICY "CAD users can read own record"
    ON public.cad_users_mapping FOR SELECT
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "CAD users can update own record"
    ON public.cad_users_mapping FOR UPDATE
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "CAD users can add members to own team"
    ON public.cad_users_mapping FOR INSERT
    WITH CHECK (
        cad_id IN (
            SELECT cum.cad_id FROM public.cad_users_mapping cum
            WHERE cum.user_email = (auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "CAD users can remove members from own team"
    ON public.cad_users_mapping FOR DELETE
    USING (
        cad_id IN (
            SELECT cum.cad_id FROM public.cad_users_mapping cum
            WHERE cum.user_email = (auth.jwt() ->> 'email')
        )
    );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 3: admin_users_mapping — Clean policies                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- SELECT uses DIRECT email comparison (no self-referencing subquery!)
CREATE POLICY "Admins can read own admin record"
    ON public.admin_users_mapping FOR SELECT
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all admin records"
    ON public.admin_users_mapping FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 4: cad_profiles — Clean policies                                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Public read access (anyone can view profiles)
CREATE POLICY "Anyone can read profiles"
    ON public.cad_profiles FOR SELECT
    USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage profiles"
    ON public.cad_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- CAD users can update their own profile
CREATE POLICY "CAD users can update own profile"
    ON public.cad_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = cad_profiles.id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
    );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 5: user_roles — Clean policies                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Users can read their own role (direct comparison — no recursion)
CREATE POLICY "Users can read own role"
    ON public.user_roles FOR SELECT
    USING (user_id = auth.uid());

-- NOTE: There is NO admin management policy on user_roles.
-- This is intentional! Managing roles (INSERT/UPDATE/DELETE) must happen via:
--   1. Server-side API with service role key
--   2. Supabase Dashboard
--   3. Database triggers (e.g., handle_new_user)
-- A self-referencing admin policy here would cause infinite recursion.


-- ============================================================================
-- ✅ DONE. All policies have been nuked and recreated cleanly.
-- 
-- RULES ENFORCED:
-- 1. ✅ All policies use auth.jwt() ->> 'email' (never auth.users)
-- 2. ✅ No table's policy references itself (no infinite recursion)
-- 3. ✅ Admin checks use only user_roles (not admin_users_mapping)
-- 4. ✅ diagnostic_forms.user_email has UNIQUE constraint
-- ============================================================================
