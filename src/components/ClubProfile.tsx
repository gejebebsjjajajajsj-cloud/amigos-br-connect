import { useState, useEffect } from 'react';
import { Lock, Play, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClubProfile {
  id: string;
  name: string;
  bio: string;
  banner_url: string | null;
  avatar_url: string | null;
  price: number;
  button_text: string;
  photos_count: number;
  videos_count: number;
}

interface GalleryItem {
  id: string;
  type: string;
  url: string;
  is_preview: boolean;
}

const ClubProfile = () => {
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, galleryRes] = await Promise.all([
        supabase.from('club_profile').select('*').single(),
        supabase.from('gallery_items').select('*').eq('is_preview', true).order('display_order').limit(6)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (galleryRes.data) setGalleryItems(galleryRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-56 md:h-72">
        {profile?.banner_url ? (
          <img 
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-primary overflow-hidden shadow-2xl ring-4 ring-primary/20">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-card flex items-center justify-center text-muted-foreground">
                ?
              </div>
            )}
          </div>

          <h1 className="mt-4 text-xl font-bold text-foreground">
            {profile?.name || 'Nome do Modelo'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.bio || 'Conteúdo exclusivo'}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{profile?.photos_count || 0}</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{profile?.videos_count || 0}</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="mt-6">
          <button className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-orange-400 p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-background px-6 py-4 transition-all group-hover:bg-background/80">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">{profile?.button_text || 'Desbloquear'}</span>
              <span className="text-primary font-bold">R$ {profile?.price?.toFixed(2).replace('.', ',') || '29,90'}</span>
            </div>
          </button>
        </div>

        {/* Preview Gallery */}
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-3">Prévia</p>
          <div className="grid grid-cols-3 gap-1.5">
            {galleryItems.length > 0 ? (
              galleryItems.map((item) => (
                <div 
                  key={item.id}
                  className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                >
                  {item.type === 'photo' ? (
                    <img 
                      src={item.url}
                      alt="Preview"
                      className="w-full h-full object-cover blur-md scale-105"
                    />
                  ) : (
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover blur-md scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <Play className="w-6 h-6 text-foreground/70" fill="currentColor" />
                    ) : (
                      <Lock className="w-5 h-5 text-foreground/70" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Placeholder items when no gallery
              [...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden relative bg-card"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
