-- ============================================================================
-- FIX: Infinite Recursion in cad_users_mapping RLS
-- ============================================================================
-- Issue: The policy "CAD users can read own team" queried cad_users_mapping 
-- while evaluating SELECT on cad_users_mapping, causing an infinite loop.
-- Solution: Use a SECURITY DEFINER function to bypass RLS when checking team membership.
-- Also: Adds missing Admin policies for cad_users_mapping so admins can manage it.

-- 1. Create SECURITY DEFINER function to get the current user's CAD IDs safely
CREATE OR REPLACE FUNCTION get_my_cad_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT cad_id FROM cad_users_mapping WHERE user_email = auth.jwt()->>'email';
$$;

-- 2. Drop the recursive and broken policies on cad_users_mapping
DROP POLICY IF EXISTS "CAD users can read own record" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can read own team" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can update own record" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can add members to own team" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "CAD users can remove members from own team" ON public.cad_users_mapping;

-- 3. Recreate CAD User Policies using the safe function
CREATE POLICY "CAD users can read own team"
    ON public.cad_users_mapping
    FOR SELECT
    USING ( cad_id IN (SELECT get_my_cad_ids()) );

CREATE POLICY "CAD users can update own record"
    ON public.cad_users_mapping
    FOR UPDATE
    USING ( user_email = (auth.jwt() ->> 'email') );

CREATE POLICY "CAD users can add members to own team"
    ON public.cad_users_mapping
    FOR INSERT
    WITH CHECK ( cad_id IN (SELECT get_my_cad_ids()) );

CREATE POLICY "CAD users can remove members from own team"
    ON public.cad_users_mapping
    FOR DELETE
    USING ( cad_id IN (SELECT get_my_cad_ids()) );

-- 4. Add MISSING Admin Policies for cad_users_mapping
DROP POLICY IF EXISTS "Admins can manage all cad users" ON public.cad_users_mapping;
CREATE POLICY "Admins can manage all cad users"
    ON public.cad_users_mapping
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
