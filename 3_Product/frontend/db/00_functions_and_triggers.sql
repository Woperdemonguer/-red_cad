-- Migration: Core Database Functions & Triggers
-- This file defines reusable functions used across multiple tables.
-- Should be run BEFORE any table-specific migrations that reference these functions.

-- 1. Auto-update `updated_at` timestamp on row modification
-- Used by: cad_profiles, products, prices_availability, diagnostic_forms
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply updated_at trigger to all tables that have the column
-- (idempotent — DROP IF EXISTS before CREATE)

DROP TRIGGER IF EXISTS update_cad_profiles_modtime ON public.cad_profiles;
CREATE TRIGGER update_cad_profiles_modtime
    BEFORE UPDATE ON public.cad_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

DROP TRIGGER IF EXISTS update_diagnostic_forms_modtime ON public.diagnostic_forms;
CREATE TRIGGER update_diagnostic_forms_modtime
    BEFORE UPDATE ON public.diagnostic_forms
    FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

-- Note: products and prices_availability triggers are defined in supabase_products_setup.sql
-- but they reference this function. Run this file first.
