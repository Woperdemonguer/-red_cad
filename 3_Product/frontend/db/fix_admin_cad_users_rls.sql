-- ============================================================================
-- Migration: Add admin read/write access to cad_users_mapping
-- ============================================================================
--
-- PROBLEM: Admins cannot see team members when editing a CAD's profile from
--          the admin panel (/profile?cad_id=X). The current RLS policy only
--          allows users to read their OWN row (user_email match).
--
-- FIX:     Add an "Admins can manage all CAD users" policy that checks
--          user_roles for admin role, matching the pattern used on other tables.
--
-- SAFE:    Idempotent (DROP IF EXISTS + CREATE). Run as many times as needed.
-- RUN:     Supabase Dashboard → SQL Editor → Paste → Run
-- ============================================================================

-- Drop if already exists (idempotent)
DROP POLICY IF EXISTS "Admins can manage all cad users" ON public.cad_users_mapping;
DROP POLICY IF EXISTS "Admins can read all cad users" ON public.cad_users_mapping;

-- Allow admins full read access to all cad_users_mapping rows
CREATE POLICY "Admins can read all cad users"
    ON public.cad_users_mapping FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Allow admins full write access (INSERT/UPDATE/DELETE) to all cad_users_mapping rows
CREATE POLICY "Admins can manage all cad users"
    ON public.cad_users_mapping FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- ============================================================================
-- ✅ DONE. Admins can now see and manage team members for any CAD.
-- ============================================================================
