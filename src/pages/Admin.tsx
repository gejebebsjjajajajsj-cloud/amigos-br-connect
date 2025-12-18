import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Save, LogOut, Trash2, Image, Video, Home } from 'lucide-react';

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
  thumbnail_url: string | null;
  is_preview: boolean;
  display_order: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    const [profileRes, galleryRes] = await Promise.all([
      supabase.from('club_profile').select('*').single(),
      supabase.from('gallery_items').select('*').order('display_order')
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (galleryRes.data) setGalleryItems(galleryRes.data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('club-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('club-media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset input so selecting the same file again triggers onChange
    e.target.value = '';
    if (!file || !profile) return;

    setUploadingBanner(true);
    try {
      const url = await uploadFile(file, 'banners');
      const { error } = await supabase
        .from('club_profile')
        .update({ banner_url: url })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, banner_url: url });
      toast.success('Banner atualizado!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao fazer upload do banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, 'avatars');
      const { error } = await supabase
        .from('club_profile')
        .update({ avatar_url: url })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, avatar_url: url });
      toast.success('Foto de perfil atualizada!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao fazer upload da foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, type === 'photo' ? 'photos' : 'videos');
        
        const { error, data } = await supabase
          .from('gallery_items')
          .insert({
            type,
            url,
            is_preview: true,
            display_order: galleryItems.length
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setGalleryItems(prev => [...prev, data]);
      }
      toast.success('Mídia adicionada!');
    } catch {
      toast.error('Erro ao fazer upload');
    }
    setUploadingGallery(false);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao deletar');
      return;
    }

    setGalleryItems(galleryItems.filter(item => item.id !== id));
    toast.success('Item removido!');
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('club_profile')
      .update({
        name: profile.name,
        bio: profile.bio,
        price: profile.price,
        button_text: profile.button_text,
        photos_count: profile.photos_count,
        videos_count: profile.videos_count
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao salvar');
    } else {
      toast.success('Perfil salvo!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Site
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Banner Upload */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Banner</h2>
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingBanner ? 'Enviando...' : 'Trocar banner'}
                </span>
              </Button>
            </label>
          </div>

          <div className="relative h-40 bg-card rounded-xl overflow-hidden border border-border">
            {profile?.banner_url ? (
              <img src={profile.banner_url} alt="Banner do clube" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sem banner
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Se der erro, tente uma imagem menor (ex: JPG/PNG).
          </p>
        </section>

        {/* Avatar Upload */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Foto de Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground text-xs">
                  Sem foto
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                <Upload className="w-5 h-5 text-foreground" />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Clique para alterar</p>
          </div>
        </section>

        {/* Profile Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Informações</h2>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profile?.name || ''}
              onChange={(e) => setProfile(profile ? { ...profile, name: e.target.value } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Descrição</Label>
            <Textarea
              id="bio"
              value={profile?.bio || ''}
              onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Texto do Botão</Label>
              <Input
                id="button_text"
                value={profile?.button_text || ''}
                onChange={(e) => setProfile(profile ? { ...profile, button_text: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={profile?.price || 0}
                onChange={(e) => setProfile(profile ? { ...profile, price: parseFloat(e.target.value) } : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="photos_count">Qtd. Fotos</Label>
              <Input
                id="photos_count"
                type="number"
                value={profile?.photos_count || 0}
                onChange={(e) => setProfile(profile ? { ...profile, photos_count: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videos_count">Qtd. Vídeos</Label>
              <Input
                id="videos_count"
                type="number"
                value={profile?.videos_count || 0}
                onChange={(e) => setProfile(profile ? { ...profile, videos_count: parseInt(e.target.value) } : null)}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </section>

        {/* Gallery */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Galeria</h2>
            <div className="flex gap-2">
              <label>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleGalleryUpload(e, 'photo')} disabled={uploadingGallery} />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Image className="w-4 h-4 mr-1" />
                    Foto
                  </span>
                </Button>
              </label>
              <label>
                <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleGalleryUpload(e, 'video')} disabled={uploadingGallery} />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Video className="w-4 h-4 mr-1" />
                    Vídeo
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {galleryItems.map((item) => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden relative group">
                {item.type === 'photo' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => handleDeleteGalleryItem(item.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
            {galleryItems.length === 0 && (
              <div className="col-span-3 py-8 text-center text-muted-foreground text-sm">
                Nenhum item na galeria
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
