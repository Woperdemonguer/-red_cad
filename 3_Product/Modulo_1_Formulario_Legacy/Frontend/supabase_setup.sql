-- Setup SQL script for RedCAD Hub Database

-- Create table for storing diagnostic forms
CREATE TABLE IF NOT EXISTS public.diagnostic_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.diagnostic_forms ENABLE ROW LEVEL SECURITY;

-- Policy to allow the user to select only their own forms
CREATE POLICY "Users can view their own forms"
ON public.diagnostic_forms
FOR SELECT
USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = user_email
));

-- Policy to allow the user to insert their own forms
CREATE POLICY "Users can insert their own forms"
ON public.diagnostic_forms
FOR INSERT
WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = user_email
));

-- Policy to allow the user to update their own forms
CREATE POLICY "Users can update their own forms"
ON public.diagnostic_forms
FOR UPDATE
USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = user_email
));

-- We also need to automatically update the 'last_updated' timestamp on every edit
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diagnostic_forms_modtime
BEFORE UPDATE ON public.diagnostic_forms
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
