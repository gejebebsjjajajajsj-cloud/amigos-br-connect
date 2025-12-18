import { Button } from '@/components/ui/button';
import { Lock, Play } from 'lucide-react';

const ClubProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-56 md:h-72">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-background overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="mt-4 text-xl font-bold text-foreground">
            Nome do Modelo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conteúdo exclusivo
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">120</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">45</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="mt-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base">
            <Lock className="w-4 h-4 mr-2" />
            Desbloquear - R$ 29,90/mês
          </Button>
        </div>

        {/* Preview Gallery */}
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-3">Prévia</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
              "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
              "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300",
            ].map((src, i) => (
              <div 
                key={i}
                className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
              >
                <img 
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover blur-md scale-105"
                />
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  {i === 2 ? (
                    <Play className="w-6 h-6 text-foreground/70" fill="currentColor" />
                  ) : (
                    <Lock className="w-5 h-5 text-foreground/70" />
                  )}
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
