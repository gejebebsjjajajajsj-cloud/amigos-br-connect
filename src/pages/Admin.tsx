import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Save, LogOut, Trash2, Image, Video, Home, Link2, Plus, ArrowLeft, ExternalLink } from 'lucide-react';

interface ClubProfile {
  id: string;
  name: string;
  bio: string;
  banner_url: string | null;
  avatar_url: string | null;
  price: number;
  button_text: string;
  button_color: string;
  deliverable_link: string | null;
  photos_count: number;
  videos_count: number;
  slug: string | null;
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
  const [profiles, setProfiles] = useState<ClubProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ClubProfile | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'list' | 'edit'>('list');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('Acesso negado. Você não é administrador.');
      await supabase.auth.signOut();
      navigate('/auth');
      return;
    }

    setIsAdmin(true);
    fetchProfiles();
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('club_profile')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProfiles(data.map(p => ({
        ...p,
        button_color: p.button_color || '#f97316',
        deliverable_link: p.deliverable_link || null
      })));
    }
    setLoading(false);
  };

  const fetchGalleryItems = async () => {
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('display_order');
    if (data) setGalleryItems(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleCreateProfile = async () => {
    const slug = `modelo-${Date.now()}`;
    const { data, error } = await supabase
      .from('club_profile')
      .insert({
        name: 'Novo Perfil',
        bio: 'Descrição do perfil',
        price: 29.90,
        slug
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar perfil');
      return;
    }

    if (data) {
      const newProfile = {
        ...data,
        button_color: data.button_color || '#f97316',
        deliverable_link: data.deliverable_link || null
      };
      setProfiles([newProfile, ...profiles]);
      setSelectedProfile(newProfile);
      setView('edit');
      toast.success('Perfil criado! Configure o slug da URL.');
    }
  };

  const handleSelectProfile = async (profile: ClubProfile) => {
    setSelectedProfile(profile);
    setView('edit');
    await fetchGalleryItems();
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este perfil?')) return;
    
    const { error } = await supabase
      .from('club_profile')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir perfil');
      return;
    }

    setProfiles(profiles.filter(p => p.id !== id));
    toast.success('Perfil excluído!');
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
    e.target.value = '';
    if (!file || !selectedProfile) return;

    setUploadingBanner(true);
    try {
      const url = await uploadFile(file, 'banners');
      const { error } = await supabase
        .from('club_profile')
        .update({ banner_url: url })
        .eq('id', selectedProfile.id);

      if (error) throw error;
      setSelectedProfile({ ...selectedProfile, banner_url: url });
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
    if (!file || !selectedProfile) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, 'avatars');
      const { error } = await supabase
        .from('club_profile')
        .update({ avatar_url: url })
        .eq('id', selectedProfile.id);

      if (error) throw error;
      setSelectedProfile({ ...selectedProfile, avatar_url: url });
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
    if (!selectedProfile) return;

    // Validate slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (selectedProfile.slug && !slugRegex.test(selectedProfile.slug)) {
      toast.error('O slug deve conter apenas letras minúsculas, números e hífens');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('club_profile')
      .update({
        name: selectedProfile.name,
        bio: selectedProfile.bio,
        price: selectedProfile.price,
        button_text: selectedProfile.button_text,
        button_color: selectedProfile.button_color,
        deliverable_link: selectedProfile.deliverable_link,
        photos_count: selectedProfile.photos_count,
        videos_count: selectedProfile.videos_count,
        slug: selectedProfile.slug
      })
      .eq('id', selectedProfile.id);

    if (error) {
      if (error.code === '23505') {
        toast.error('Este slug já está em uso. Escolha outro.');
      } else {
        toast.error('Erro ao salvar');
      }
    } else {
      toast.success('Perfil salvo!');
      // Update in list
      setProfiles(profiles.map(p => p.id === selectedProfile.id ? selectedProfile : p));
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

  if (!isAdmin) {
    return null;
  }

  // Profile List View
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-background">
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

        <main className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Meus Perfis</h2>
            <Button onClick={handleCreateProfile} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Perfil
            </Button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum perfil criado ainda.</p>
              <Button onClick={handleCreateProfile} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Perfil
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{profile.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      /{profile.slug || 'sem-slug'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {profile.slug && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/${profile.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectProfile(profile)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Profile Edit View
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('list')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Editar Perfil</h1>
        </div>
        <div className="flex gap-2">
          {selectedProfile?.slug && (
            <Button variant="outline" size="sm" onClick={() => window.open(`/${selectedProfile.slug}`, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Perfil
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Slug (URL) */}
        <section className="space-y-3 bg-card/50 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">URL do Perfil</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Este é o endereço único do perfil. Ex: seusite.com/<strong>{selectedProfile?.slug || 'nome-modelo'}</strong>
          </p>
          <Input
            value={selectedProfile?.slug || ''}
            onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
            placeholder="nome-da-modelo"
          />
        </section>

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
            {selectedProfile?.banner_url ? (
              <img src={selectedProfile.banner_url} alt="Banner do clube" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sem banner
              </div>
            )}
          </div>
        </section>

        {/* Avatar Upload */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Foto de Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
              {selectedProfile?.avatar_url ? (
                <img src={selectedProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
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
            <Label htmlFor="name">Nome da Modelo</Label>
            <Input
              id="name"
              value={selectedProfile?.name || ''}
              onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, name: e.target.value } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Descrição</Label>
            <Textarea
              id="bio"
              value={selectedProfile?.bio || ''}
              onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, bio: e.target.value } : null)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Nome do Botão</Label>
              <Input
                id="button_text"
                value={selectedProfile?.button_text || ''}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, button_text: e.target.value } : null)}
                placeholder="Ex: Desbloquear"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={selectedProfile?.price || 0}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, price: parseFloat(e.target.value) } : null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_color">Cor do Botão</Label>
            <div className="flex gap-3 items-center">
              <input
                id="button_color"
                type="color"
                value={selectedProfile?.button_color || '#f97316'}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, button_color: e.target.value } : null)}
                className="w-12 h-10 rounded-lg cursor-pointer border border-border"
              />
              <Input
                value={selectedProfile?.button_color || '#f97316'}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, button_color: e.target.value } : null)}
                placeholder="#f97316"
                className="flex-1"
              />
              <div 
                className="h-10 px-4 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: selectedProfile?.button_color || '#f97316' }}
              >
                Preview
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="photos_count">Qtd. Fotos</Label>
              <Input
                id="photos_count"
                type="number"
                value={selectedProfile?.photos_count || 0}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, photos_count: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videos_count">Qtd. Vídeos</Label>
              <Input
                id="videos_count"
                type="number"
                value={selectedProfile?.videos_count || 0}
                onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, videos_count: parseInt(e.target.value) } : null)}
              />
            </div>
          </div>
        </section>

        {/* Deliverable Link */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Link do Entregável</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Link que será mostrado ao cliente após confirmar o pagamento (ex: grupo do Telegram/WhatsApp)
          </p>
          <Input
            value={selectedProfile?.deliverable_link || ''}
            onChange={(e) => setSelectedProfile(selectedProfile ? { ...selectedProfile, deliverable_link: e.target.value } : null)}
            placeholder="https://t.me/seugrupo ou https://chat.whatsapp.com/..."
          />
        </section>

        {/* Save Button */}
        <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Todas as Alterações'}
        </Button>

        {/* Gallery */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Galeria (Prévia)</h2>
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
