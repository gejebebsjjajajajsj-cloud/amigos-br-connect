import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface GroupCardProps {
  name: string;
  banner: string;
  link: string;
  members?: string;
}

const GroupCard = ({ name, banner, link, members }: GroupCardProps) => {
  return (
    <div className="group-card">
      <div className="group-banner">
        <img src={banner} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
        {members && (
          <p className="text-sm text-muted-foreground mb-3">{members} membros</p>
        )}
        <Button variant="telegram" className="w-full" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Send className="w-4 h-4 mr-2" />
            Entrar no Grupo
          </a>
        </Button>
      </div>
    </div>
  );
};

export default GroupCard;
