import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AgeVerification from '@/components/AgeVerification';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  slug: string | null;
}

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  useEffect(() => {
    if (isVerified) {
      fetchProfiles();
    }
  }, [isVerified]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('club_profile')
      .select('id, name, avatar_url, slug')
      .not('slug', 'is', null);
    
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
  };

  if (!isVerified) {
    return <AgeVerification onVerify={handleVerify} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground text-center mb-8">Perfis Disponíveis</h1>
        
        {profiles.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Nenhum perfil disponível ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={`/${profile.slug}`}
                className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      ?
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground text-center">{profile.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
