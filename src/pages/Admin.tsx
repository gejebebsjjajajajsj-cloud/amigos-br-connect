import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, LogOut, Upload, Home } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  link: string;
  banner_url: string | null;
  members: string | null;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [members, setMembers] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Erro ao carregar grupos', variant: 'destructive' });
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !link.trim()) {
      toast({ title: 'Preencha nome e link', variant: 'destructive' });
      return;
    }

    if (!isAdmin) {
      toast({ title: 'Você não tem permissão de admin', variant: 'destructive' });
      return;
    }

    setSaving(true);
    
    try {
      let banner_url = null;
      
      if (bannerFile) {
        const fileName = `${Date.now()}-${bannerFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, bannerFile);
        
        if (uploadError) {
          throw new Error('Erro ao fazer upload do banner');
        }
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
        
        banner_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('groups').insert({
        name: name.trim(),
        link: link.trim(),
        members: members.trim() || null,
        banner_url,
      });

      if (error) throw error;

      toast({ title: 'Grupo adicionado!' });
      setName('');
      setLink('');
      setMembers('');
      setBannerFile(null);
      setBannerPreview(null);
      fetchGroups();
    } catch (error: any) {
      toast({ 
        title: 'Erro ao salvar', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este grupo?')) return;
    
    const { error } = await supabase.from('groups').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } else {
      toast({ title: 'Grupo excluído' });
      fetchGroups();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">⚙️ Painel Admin</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-1" />
              Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {!isAdmin && (
          <div className="header-panel mb-6 text-center">
            <p className="text-yellow-500">⚠️ Você não tem permissão de administrador.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Peça para um admin adicionar sua conta como administrador.
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="header-panel mb-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Grupo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amigos BR - Geral"
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Link do Telegram</Label>
                <Input
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://t.me/+exemplo"
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="members">Membros (opcional)</Label>
                <Input
                  id="members"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Ex: 5.2K"
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banner">Banner</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Escolher imagem</span>
                    <input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                  {bannerFile && (
                    <span className="text-sm text-muted-foreground">{bannerFile.name}</span>
                  )}
                </div>
                {bannerPreview && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={bannerPreview} 
                      alt="Preview" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <Button type="submit" variant="telegram" className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Adicionar Grupo
              </Button>
            </form>
          </div>
        )}

        <div className="header-panel">
          <h2 className="text-base font-semibold mb-4">Grupos Cadastrados ({groups.length})</h2>
          
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum grupo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="group-card">
                  {group.banner_url && (
                    <div className="w-full overflow-hidden">
                      <img 
                        src={group.banner_url} 
                        alt={group.name} 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{group.name}</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{group.link}</p>
                      {group.members && (
                        <p className="text-xs text-muted-foreground">{group.members} membros</p>
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
