-- 1. Add missing UNIQUE constraint
ALTER TABLE public.diagnostic_forms ADD CONSTRAINT diagnostic_forms_user_email_key UNIQUE (user_email);

-- 2. Drop old policies that access auth.users directly
DROP POLICY IF EXISTS "Users can read own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Users can insert own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Users can update own form" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Admins can read all forms" ON public.diagnostic_forms;
DROP POLICY IF EXISTS "Admins can write all forms" ON public.diagnostic_forms;

-- 3. Recreate policies using auth.jwt() ->> 'email'
CREATE POLICY "Users can read own form"
    ON public.diagnostic_forms
    FOR SELECT
    USING (
        user_email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can insert own form"
    ON public.diagnostic_forms
    FOR INSERT
    WITH CHECK (
        user_email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can update own form"
    ON public.diagnostic_forms
    FOR UPDATE
    USING (
        user_email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Admins can read all forms"
    ON public.diagnostic_forms
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.admin_users_mapping am
            WHERE am.user_email = (auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "Admins can write all forms"
    ON public.diagnostic_forms
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.admin_users_mapping am
            WHERE am.user_email = (auth.jwt() ->> 'email')
        )
    );
