-- Supabase Migration: Expanding cad_profiles with Section 1 (Identity) & Section 4 (Maturity)
-- [Scalability Update]: Using DO blocks to make this script IDEMPOTENT. 
-- You can run this script 100 times and it will never throw a "Column already exists" error.
-- Also introduces `datos_adicionales JSONB` for absolute future-proofing of dynamic form questions.

DO $$
BEGIN

    -- 1. Identity Fields
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN forma_juridica TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN ano_constitucion INTEGER; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN num_socios_productoras INTEGER; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN num_personas_trabajadoras INTEGER; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN perfiles_equipo TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN roles_externalizados TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN tipo_gobernanza TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN propiedad_instalaciones TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN estado TEXT DEFAULT 'Activo'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN grupo_motor TEXT DEFAULT 'No'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN radio_comercializacion TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN red_supraterritorial BOOLEAN; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN red_nombre TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN actividades_cad TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN modelo_abastecimiento TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN abastecimiento_regulado BOOLEAN; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN infraestructuras_clave TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN servicios_activos_externalizados TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    
    -- 2. JSONB Future-Proofing (Scalability)
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN madurez_evaluacion JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN datos_adicionales JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;

    -- 3. Maturity / Intercooperation Fields
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN madurez_fortalezas TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN madurez_cuellos_botella TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN intercoop_compartir TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN intercoop_apoyo_necesario TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN intercoop_disposicion TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.cad_profiles ADD COLUMN intercoop_referentes TEXT; EXCEPTION WHEN duplicate_column THEN END;

END $$;
