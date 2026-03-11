-- Function to look up a user ID by email securely
-- We need this because the Supabase Admin API listUsers() can't easily filter by exact email
CREATE OR REPLACE FUNCTION public.get_auth_user_id_by_email(email_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- runs with bypassrls privileges
SET search_path = public
AS $$
DECLARE
    found_id UUID;
BEGIN
    SELECT id INTO found_id FROM auth.users WHERE email = email_address LIMIT 1;
    RETURN found_id;
END;
$$;
