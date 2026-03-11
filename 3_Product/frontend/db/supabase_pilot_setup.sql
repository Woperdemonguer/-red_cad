-- Supabase Migration: Phase 3 Pilot Project (RBAC & CAD Profiles)

-- 1. Create User Roles Table (Role-Based Access Control)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cad_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());


-- 2. Create CAD Profiles Table (Augmented Data)
CREATE TABLE public.cad_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comercial TEXT NOT NULL,
    territorio TEXT,
    descripcion_corta TEXT,
    logo_url TEXT,
    email_contacto TEXT,
    telefono TEXT,
    estado TEXT DEFAULT 'inactive', -- active, inactive, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for cad_profiles
ALTER TABLE public.cad_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read CAD profiles (Directory is public to the intranet)
CREATE POLICY "Profiles are viewable by everyone" ON public.cad_profiles
    FOR SELECT USING (true);

-- Only Admins can create/update profiles manually (or later, triggers)
CREATE POLICY "Admins can update profiles" ON public.cad_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 3. Link Users to CAD Profiles
-- We need a mapping table because 1 CAD (e.g. ValleyVega) might have 2 users (Dani & Noemi)
CREATE TABLE public.cad_users_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cad_id UUID REFERENCES public.cad_profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL, -- Email from the seed list
    nombre_persona TEXT,
    perfil_rol TEXT, -- e.g. "Socio", "Gerente"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_email)
);

-- RLS for mapping table
ALTER TABLE public.cad_users_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view mappings" ON public.cad_users_mapping
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );
