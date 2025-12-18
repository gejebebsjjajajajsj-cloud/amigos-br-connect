import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Lock, Crown, Check } from 'lucide-react';

const ClubProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-b from-primary/30 to-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Profile Section */}
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-card shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-6 space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Nome do Modelo
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Conteúdo exclusivo e personalizado. Acesse fotos e vídeos premium todos os dias.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">120+</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">45+</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">Membros</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-8 space-y-4">
          {/* Main Plan */}
          <div className="bg-card border-2 border-primary rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-semibold">
              MAIS POPULAR
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Acesso VIP Mensal</h3>
                <p className="text-muted-foreground text-sm">Acesso total ao conteúdo</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">R$ 29,90</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>
            
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" />
                Acesso a todas as fotos
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" />
                Acesso a todos os vídeos
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary" />
                Conteúdo novo toda semana
              </li>
            </ul>

            <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
              <Lock className="w-4 h-4 mr-2" />
              Desbloquear Agora
            </Button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Acesso Vitalício</h3>
                <p className="text-muted-foreground text-sm">Pague uma vez, acesse sempre</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">R$ 149,90</p>
                <p className="text-xs text-muted-foreground">pagamento único</p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 py-6">
              <Star className="w-4 h-4 mr-2" />
              Comprar Acesso Vitalício
            </Button>
          </div>
        </div>

        {/* Preview Gallery */}
        <div className="mt-8 pb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Prévia do Conteúdo</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-card rounded-lg overflow-hidden relative group cursor-pointer"
              >
                <img 
                  src={`https://images.unsplash.com/photo-${1534528741775 + i * 1000}?w=300`}
                  alt={`Preview ${i}`}
                  className="w-full h-full object-cover blur-lg"
                />
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
