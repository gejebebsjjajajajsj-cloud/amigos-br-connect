import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import GroupCard from '@/components/GroupCard';
import { Users, MapPin, Loader2 } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  link: string;
  banner_url: string | null;
  members: string | null;
}

const Index = () => {
  const { city, loading: geoLoading } = useGeolocation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      setGroups(data || []);
      setLoading(false);
    };

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Panel */}
      <section className="px-3 py-4 sm:px-4">
        <div className="header-panel w-full max-w-md mx-auto">
          <h1 className="text-lg sm:text-xl font-bold text-center text-foreground mb-3">
            🇧🇷 Amigos BR
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="stats-badge">
              <Users className="w-4 h-4 text-primary" />
              <span>20.458 inscritos</span>
            </div>

            <div className="location-badge">
              <MapPin className="w-4 h-4" />
              {geoLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Detectando...
                </span>
              ) : (
                <span>{city}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <main className="px-3 pb-8 sm:px-4">
        <h2 className="text-sm sm:text-base font-semibold text-foreground mb-4 text-center">
          Grupos Disponíveis
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum grupo disponível no momento
          </p>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                name={group.name}
                banner={group.banner_url || ''}
                link={group.link}
                members={group.members || undefined}
                location={city}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-muted-foreground text-xs text-center">
          © 2024 Amigos BR
        </p>
      </footer>
    </div>
  );
};

export default Index;
