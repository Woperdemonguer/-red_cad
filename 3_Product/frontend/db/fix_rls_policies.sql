-- Migration: Fix RLS Policies
-- Fixes critical security issues identified in the architecture audit.
-- Run this in the Supabase SQL Editor on the live database.

-- ============================================================================
-- FIX 1: cad_users_mapping — Add policies for CAD members
-- Currently: Only admins can read/write. CAD users have NO access to their own team.
-- Fix: Add SELECT + UPDATE policies for CAD members to see their own team.
-- ============================================================================

-- CAD users can READ their own team (all members of the same CAD)
CREATE POLICY "CAD users can read own team"
    ON public.cad_users_mapping
    FOR SELECT
    USING (
        cad_id IN (
            SELECT cum.cad_id FROM public.cad_users_mapping cum
            WHERE cum.user_email = (auth.jwt() ->> 'email')
        )
    );

-- CAD users can UPDATE their own row only (self-edit)
CREATE POLICY "CAD users can update own record"
    ON public.cad_users_mapping
    FOR UPDATE
    USING (
        user_email = (auth.jwt() ->> 'email')
    );

-- CAD users can INSERT new members into their own CAD
CREATE POLICY "CAD users can add members to own team"
    ON public.cad_users_mapping
    FOR INSERT
    WITH CHECK (
        cad_id IN (
            SELECT cum.cad_id FROM public.cad_users_mapping cum
            WHERE cum.user_email = (auth.jwt() ->> 'email')
        )
    );

-- CAD users can DELETE members from their own CAD
CREATE POLICY "CAD users can remove members from own team"
    ON public.cad_users_mapping
    FOR DELETE
    USING (
        cad_id IN (
            SELECT cum.cad_id FROM public.cad_users_mapping cum
            WHERE cum.user_email = (auth.jwt() ->> 'email')
        )
    );


-- ============================================================================
-- FIX 2: products — Fix broken RLS
-- Problem: Uses `auth.uid() = cad_id` but cad_id is a cad_profiles UUID, not auth UUID.
-- Fix: Check if the current user's email is mapped to the product's cad_id.
-- ============================================================================

-- Drop the broken policies
DROP POLICY IF EXISTS "CADs can insert their own products" ON public.products;
DROP POLICY IF EXISTS "CADs can update their own products" ON public.products;

-- Recreate with correct logic
CREATE POLICY "CADs can insert their own products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = products.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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

CREATE POLICY "CADs can update their own products"
    ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = products.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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

-- Add DELETE policy (was missing entirely)
CREATE POLICY "CADs can delete their own products"
    ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = products.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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


-- ============================================================================
-- FIX 3: prices_availability — Same broken RLS as products
-- ============================================================================

DROP POLICY IF EXISTS "CADs can insert prices for their products" ON public.prices_availability;
DROP POLICY IF EXISTS "CADs can update prices for their products" ON public.prices_availability;

CREATE POLICY "CADs can insert prices for their products"
    ON public.prices_availability
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = prices_availability.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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

CREATE POLICY "CADs can update prices for their products"
    ON public.prices_availability
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = prices_availability.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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

CREATE POLICY "CADs can delete prices for their products"
    ON public.prices_availability
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = prices_availability.cad_id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
        OR
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


-- ============================================================================
-- FIX 4: cad_profiles — Admin policy must check both admin sources
-- The current "Admins can update profiles" only checks user_roles.
-- An admin who exists ONLY in admin_users_mapping cannot create/edit profiles.
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update profiles" ON public.cad_profiles;

CREATE POLICY "Admins can manage profiles"
    ON public.cad_profiles
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

-- Also allow CAD users to UPDATE their own profile
CREATE POLICY "CAD users can update own profile"
    ON public.cad_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cad_users_mapping cum
            WHERE cum.cad_id = cad_profiles.id
            AND cum.user_email = (auth.jwt() ->> 'email')
        )
    );
