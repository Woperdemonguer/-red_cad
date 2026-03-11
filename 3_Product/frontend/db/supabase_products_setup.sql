-- Setup SQL script for RedCAD Hub Product Database (Phase 2)

-- Enums for constrained values
CREATE TYPE product_category AS ENUM (
    'Huerta', 'Fruta', 'Cítricos', 'Frutos secos', 'Olivar/aceite', 
    'Viña/vino', 'Cereales/legumbres', 'Carne', 'Lácteos', 'Huevos', 
    'Apicultura', 'Transformados', 'Panadería', 'Bebidas'
);

CREATE TYPE product_conservation AS ENUM (
    'Ambiente', 'Frío', 'Congelado'
);

CREATE TYPE product_origin AS ENUM (
    'Producción propia socias', 
    'Compra externa estable', 
    'Compra externa puntual'
);

-- Note: In a real environment, cad_id would be a foreign key to a cad_profiles table.
-- Assuming cad_profiles will be created, or we can use the user_id from auth.users for now.
-- We will use UUID for cad_id to match Supabase's auth.users id format.

-- Create table for storing Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cad_id UUID NOT NULL, -- FK to CAD profile or auth.users
    nombre TEXT NOT NULL,
    categoria product_category NOT NULL,
    subcategoria TEXT,
    variedad TEXT,
    calibre TEXT,
    formato_venta TEXT,
    tipo_envase TEXT,
    certificaciones TEXT[], -- Array of strings
    conservacion product_conservation,
    vida_util_dias INTEGER,
    ficha_tecnica_url TEXT,
    origen product_origin,
    n_productores INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for storing Prices and Availability (Junction/Detail table)
CREATE TABLE IF NOT EXISTS public.prices_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    cad_id UUID NOT NULL, -- Redundant but useful for quick filtering by CAD without JOIN
    precio_compra_socio DECIMAL(10, 2),
    precio_venta_min DECIMAL(10, 2),
    precio_venta_max DECIMAL(10, 2),
    precio_medio_historico DECIMAL(10, 2),
    capacidad_actual_kg DECIMAL(10, 2),
    potencial_ampliacion TEXT,
    meses_disponibles INTEGER[], -- Array of integers 1-12
    meses_pico INTEGER[], -- Array of integers 1-12
    pedido_minimo TEXT,
    anticipacion_pedido TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true); -- Publicly viewable within the app

CREATE POLICY "CADs can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = cad_id);

CREATE POLICY "CADs can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = cad_id);

-- Row Level Security (RLS) for Prices & Availability
ALTER TABLE public.prices_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prices and availability"
ON public.prices_availability
FOR SELECT
USING (true);

CREATE POLICY "CADs can insert prices for their products"
ON public.prices_availability
FOR INSERT
WITH CHECK (auth.uid() = cad_id);

CREATE POLICY "CADs can update prices for their products"
ON public.prices_availability
FOR UPDATE
USING (auth.uid() = cad_id);

-- Triggers for updated_at
CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_prices_availability_modtime
BEFORE UPDATE ON public.prices_availability
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
