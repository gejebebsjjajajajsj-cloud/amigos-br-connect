-- Add slug column to club_profile for URL routing
ALTER TABLE public.club_profile 
ADD COLUMN slug text UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_club_profile_slug ON public.club_profile(slug);

-- Update existing profile with a default slug if any exists
UPDATE public.club_profile SET slug = 'modelo' WHERE slug IS NULL;