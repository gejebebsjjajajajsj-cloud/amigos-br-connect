import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface AgeVerificationProps {
  onVerify: () => void;
}

const AgeVerification = ({ onVerify }: AgeVerificationProps) => {
  const handleExit = () => {
    window.location.href = 'https://google.com';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Verificação de Idade
          </h1>
          <p className="text-muted-foreground">
            Este site contém conteúdo exclusivo para maiores de 18 anos.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Ao clicar em "Tenho 18+" você confirma que tem mais de 18 anos e concorda com os termos de uso.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onVerify}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              Tenho 18+
            </Button>
            <Button 
              variant="outline"
              onClick={handleExit}
              className="w-full"
            >
              Sair
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Ao acessar, você concorda com nossa política de privacidade.
        </p>
      </div>
    </div>
  );
};

export default AgeVerification;
