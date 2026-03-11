-- Archivo: fix_recursion.sql
-- Esto soluciona el error interno de Supabase (Infinite Recursion) que bloqueaba 
-- la carga del Panel Admin y del Directorio.

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;

-- Note: The admin can still read their own role due to the policy:
-- "Users can read own role" WHICH we keep intact.
