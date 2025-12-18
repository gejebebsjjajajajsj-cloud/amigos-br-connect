-- Create club profile table
CREATE TABLE public.club_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Nome do Modelo',
  bio TEXT DEFAULT 'Conteúdo exclusivo',
  banner_url TEXT,
  avatar_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 29.90,
  button_text TEXT DEFAULT 'Desbloquear',
  photos_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.club_profile ENABLE ROW LEVEL SECURITY;

-- Anyone can view the profile
CREATE POLICY "Anyone can view club profile"
ON public.club_profile
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update club profile"
ON public.club_profile
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can insert club profile"
ON public.club_profile
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create gallery items table
CREATE TABLE public.gallery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_preview BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery items
CREATE POLICY "Anyone can view gallery items"
ON public.gallery_items
FOR SELECT
USING (true);

-- Only admins can manage gallery
CREATE POLICY "Admins can insert gallery items"
ON public.gallery_items
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery items"
ON public.gallery_items
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery items"
ON public.gallery_items
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for club media
INSERT INTO storage.buckets (id, name, public) VALUES ('club-media', 'club-media', true);

-- Storage policies for club media
CREATE POLICY "Anyone can view club media"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-media');

CREATE POLICY "Admins can upload club media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'club-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update club media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'club-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete club media"
ON storage.objects FOR DELETE
USING (bucket_id = 'club-media' AND public.has_role(auth.uid(), 'admin'));

-- Insert default profile
INSERT INTO public.club_profile (name, bio, price, button_text, photos_count, videos_count)
VALUES ('Nome do Modelo', 'Conteúdo exclusivo', 29.90, 'Desbloquear', 120, 45);

-- Trigger for updated_at
CREATE TRIGGER update_club_profile_updated_at
BEFORE UPDATE ON public.club_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();