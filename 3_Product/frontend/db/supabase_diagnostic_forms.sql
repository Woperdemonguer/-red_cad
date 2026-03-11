-- Migration: Diagnostic Forms Table
-- This table stores the multi-section diagnostic questionnaire answers.
-- Each CAD's primary contact email has one row with all answers as JSONB.
-- 
-- NOTE: If this table already exists in Supabase, this file serves as 
-- documentation. Run only on fresh environments.

CREATE TABLE IF NOT EXISTS public.diagnostic_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Users can read/write their own form
ALTER TABLE public.diagnostic_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own form"
    ON public.diagnostic_forms
    FOR SELECT
    USING (
        user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert own form"
    ON public.diagnostic_forms
    FOR INSERT
    WITH CHECK (
        user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own form"
    ON public.diagnostic_forms
    FOR UPDATE
    USING (
        user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- RLS: Admins can read all forms (for viewing any CAD's form via ?cad_id=)
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
            WHERE am.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- RLS: Admins can write all forms (for editing any CAD's form)
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
            WHERE am.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
