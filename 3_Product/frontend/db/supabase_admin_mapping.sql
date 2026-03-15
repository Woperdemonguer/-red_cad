CREATE TABLE public.admin_users_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    nombre_persona TEXT,
    perfil_rol TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users_mapping ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage other admins
CREATE POLICY "Admins can view and manage admin mappings" ON public.admin_users_mapping
    FOR ALL USING (
        -- Legacy user_roles check or inside admin_users_mapping check
        EXISTS (
            SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.admin_users_mapping am WHERE am.user_email = (auth.jwt() ->> 'email')
        )
    );
