import { useGeolocation } from '@/hooks/useGeolocation';
import GroupCard from '@/components/GroupCard';
import { Users, MapPin, Loader2 } from 'lucide-react';
import banner1 from '@/assets/banner1.jpg';
import banner2 from '@/assets/banner2.jpg';
import banner3 from '@/assets/banner3.jpg';
import banner4 from '@/assets/banner4.jpg';

const groups = [
  {
    name: 'Amigos BR - Geral',
    banner: banner1,
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
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-foreground">
            🇧🇷 Amigos BR
          </h1>
        </div>
      </header>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Subscribers Count */}
          <div className="stats-badge">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold">20.458 inscritos</span>
          </div>

          {/* Location */}
          <div className="location-badge">
            <MapPin className="w-5 h-5" />
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detectando...
              </span>
            ) : (
              <span className="font-semibold">{city}</span>
            )}
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <main className="container mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">
          Grupos Disponíveis
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {groups.map((group, index) => (
            <GroupCard
              key={index}
              name={group.name}
              banner={group.banner}
              link={group.link}
              members={group.members}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Amigos BR - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
