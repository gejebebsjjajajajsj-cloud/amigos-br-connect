import { useGeolocation } from '@/hooks/useGeolocation';
import GroupCard from '@/components/GroupCard';
import { Users, MapPin, Loader2 } from 'lucide-react';
import banner1 from '@/assets/banner1.jpg';
import banner2 from '@/assets/banner2.jpg';
import banner3 from '@/assets/banner3.jpg';
import banner4 from '@/assets/banner4.jpg';
import banner5 from '@/assets/banner5.jpg';

const groups = [
  {
    name: 'Amigos BR - Geral',
    banner: banner5,
    link: 'https://t.me/+exemplo1',
    members: '5.2K',
  },
  {
    name: 'Amigos BR - Bate-Papo',
    banner: banner2,
    link: 'https://t.me/+exemplo2',
    members: '3.8K',
  },
  {
    name: 'Amigos BR - Encontros',
    banner: banner3,
    link: 'https://t.me/+exemplo3',
    members: '2.1K',
  },
  {
    name: 'Amigos BR - Noturno',
    banner: banner4,
    link: 'https://t.me/+exemplo4',
    members: '4.5K',
  },
];

const Index = () => {
  const { city, loading } = useGeolocation();

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
              {loading ? (
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
        
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
          {groups.map((group, index) => (
            <GroupCard
              key={index}
              name={group.name}
              banner={group.banner}
              link={group.link}
              members={group.members}
              location={city}
            />
          ))}
        </div>
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
