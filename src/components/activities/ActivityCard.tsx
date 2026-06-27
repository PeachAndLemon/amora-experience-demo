import { Activity } from '@/types/amora';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle, Hand, Palette, Heart, Check } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onStart: () => void;
}

const typeConfig = {
  conversation: { icon: MessageCircle, label: 'Conversation', color: 'text-gold' },
  physical: { icon: Hand, label: 'Physical', color: 'text-primary' },
  creative: { icon: Palette, label: 'Creative', color: 'text-wine-light' },
  mindfulness: { icon: Heart, label: 'Mindfulness', color: 'text-wine' },
};

export function ActivityCard({ activity, onStart }: ActivityCardProps) {
  const config = typeConfig[activity.type];
  const TypeIcon = config.icon;

  if (activity.isCompleted) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Check className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{activity.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Check className="w-3 h-3" /> Completed
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <TypeIcon className={`w-6 h-6 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.duration}
            </span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        </div>
      </div>

      <Button
        variant="sunset"
        size="sm"
        className="w-full mt-4"
        onClick={onStart}
      >
        Begin Together
      </Button>
    </div>
  );
}
