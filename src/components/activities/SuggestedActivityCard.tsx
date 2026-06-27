import { Activity } from '@/types/amora';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';

interface SuggestedActivityCardProps {
  activity: Activity;
  reason: string;
  onStart: () => void;
}

export function SuggestedActivityCard({ activity, reason, onStart }: SuggestedActivityCardProps) {
  return (
    <div className="relative bg-card rounded-2xl p-5 shadow-card border border-gold/30 overflow-hidden">
      {/* AI badge */}
      <div className="absolute top-0 right-0 bg-gold/10 px-3 py-1 rounded-bl-xl">
        <div className="flex items-center gap-1 text-gold">
          <Sparkles className="w-3 h-3" />
          <span className="text-xs font-medium">Suggested</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4">
        <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{activity.duration}</span>
        </div>
        <p className="text-sm text-muted-foreground italic">
          "{reason}"
        </p>
      </div>

      <Button
        variant="gold"
        size="sm"
        className="w-full mt-4"
        onClick={onStart}
      >
        Try This Next
      </Button>
    </div>
  );
}
