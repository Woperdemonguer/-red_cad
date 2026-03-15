-- ============================================================================
-- Migration: Fix ALL RLS policies that use `auth.users` (systemic vulnerability)
-- ============================================================================
-- 
-- PROBLEM: RLS policies across 6 tables use `(SELECT email FROM auth.users WHERE id = auth.uid())`
--          which fails with "permission denied for table users" for non-admin roles.
--
-- FIX:    Replace with `(auth.jwt() ->> 'email')` which reads from the JWT session token.
--
-- SAFE:   This script is idempotent (DROP IF EXISTS + CREATE). Run it as many times as needed.
-- RUN:    Supabase Dashboard → SQL Editor → Paste → Run
-- ============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 1: diagnostic_forms                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1a. Ensure UNIQUE constraint on user_email (required for upsert)
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

-- 1b. Fix RLS policies
DROP POLICY IF EXISTS "Users can read own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Users can insert own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Users can update own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Admins can read all forms" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Admins can write all forms" ON public.diagnostic_forms;

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
-- ║ TABLE 2: cad_users_mapping                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "CAD users can read own team" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can read own record" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can update own record" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can add members to own team" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can remove members from own team" ON public.cad_users_mapping;

-- CRITICAL: The SELECT policy CANNOT subquery cad_users_mapping itself (infinite recursion).
-- Instead, we allow each user to read rows matching their email directly.
-- Then the INSERT/DELETE policies can safely subquery for cad_id because SELECT is non-recursive.
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
-- ║ TABLE 3: products (SKIPPED if table does not exist)                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        EXECUTE 'DROP POLICY IF EXISTS "CADs can insert their own products" ON public.products';
        EXECUTE 'DROP POLICY IF EXISTS "CADs can update their own products" ON public.products';
        EXECUTE 'DROP POLICY IF EXISTS "CADs can delete their own products" ON public.products';

        EXECUTE '
        CREATE POLICY "CADs can insert their own products"
            ON public.products FOR INSERT
            WITH CHECK (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = products.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        EXECUTE '
        CREATE POLICY "CADs can update their own products"
            ON public.products FOR UPDATE
            USING (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = products.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        EXECUTE '
        CREATE POLICY "CADs can delete their own products"
            ON public.products FOR DELETE
            USING (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = products.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        RAISE NOTICE '✅ products — policies fixed';
    ELSE
        RAISE NOTICE '⏭️  products — table does not exist, skipping';
    END IF;
END $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 4: prices_availability (SKIPPED if table does not exist)          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prices_availability') THEN
        EXECUTE 'DROP POLICY IF EXISTS "CADs can insert prices for their products" ON public.prices_availability';
        EXECUTE 'DROP POLICY IF EXISTS "CADs can update prices for their products" ON public.prices_availability';
        EXECUTE 'DROP POLICY IF EXISTS "CADs can delete prices for their products" ON public.prices_availability';

        EXECUTE '
        CREATE POLICY "CADs can insert prices for their products"
            ON public.prices_availability FOR INSERT
            WITH CHECK (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = prices_availability.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        EXECUTE '
        CREATE POLICY "CADs can update prices for their products"
            ON public.prices_availability FOR UPDATE
            USING (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = prices_availability.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        EXECUTE '
        CREATE POLICY "CADs can delete prices for their products"
            ON public.prices_availability FOR DELETE
            USING (
                EXISTS (SELECT 1 FROM public.cad_users_mapping cum WHERE cum.cad_id = prices_availability.cad_id AND cum.user_email = (auth.jwt() ->>''email''))
                OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin'')
                OR EXISTS (SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->>''email''))
            )';

        RAISE NOTICE '✅ prices_availability — policies fixed';
    ELSE
        RAISE NOTICE '⏭️  prices_availability — table does not exist, skipping';
    END IF;
END $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ TABLE 5: admin_users_mapping                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Admins can view and manage admin mappings" ON public.admin_users_mapping;
DROP POLICY IF EXISTS "Admins can read own admin record" ON public.admin_users_mapping;
DROP POLICY IF EXISTS "Admins can manage all admin records" ON public.admin_users_mapping;

-- CRITICAL: This table CANNOT reference itself in policies (infinite recursion).
-- The SELECT policy uses a direct email match — no subquery needed.
-- The ALL policy uses user_roles only — no self-reference.
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
-- ║ TABLE 6: cad_profiles (admin policies)                                  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.cad_profiles;
DROP POLICY IF EXISTS "CAD users can update own profile" ON public.cad_profiles;

CREATE POLICY "Admins can manage profiles"
    ON public.cad_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "CAD users can update own profile"
    ON public.cad_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = cad_profiles.id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
    );


-- ============================================================================
-- ✅ DONE. All RLS policies now use auth.jwt() ->> 'email' instead of auth.users.
-- ============================================================================
