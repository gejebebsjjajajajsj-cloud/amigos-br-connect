import { Button } from '@/components/ui/button';
import { Send, MapPin } from 'lucide-react';

interface GroupCardProps {
  name: string;
  banner: string;
  link: string;
  members?: string;
  location?: string;
}

const GroupCard = ({ name, banner, link, members, location }: GroupCardProps) => {
  return (
    <div className="group-card">
      {banner && (
        <div className="w-full overflow-hidden rounded-t-2xl">
          <img src={banner} alt={name} className="w-full h-auto" />
        </div>
      )}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {members && <span>{members} membros</span>}
          {location && (
            <span className="flex items-center gap-1 text-red-400">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
        </div>
        <Button variant="telegram" size="sm" className="w-full text-xs" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Send className="w-3 h-3 mr-1" />
            Entrar
          </a>
        </Button>
      </div>
    </div>
  );
};

export default GroupCard;
