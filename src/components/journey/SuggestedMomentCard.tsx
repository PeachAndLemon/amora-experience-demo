import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AmoraEvent } from '@/types/amora';
import { MapPin, Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface SuggestedMomentCardProps {
  type: 'activity' | 'event';
  item: Activity | AmoraEvent;
  reason: string;
  onStart: () => void;
}

// Pillar ID to icon ID mapping (6 core pillars)
const milestoneIconMap: Record<string, string> = {
  'sync-up': 'sync-up',
  'altitude-resilience': 'altitude-resilience',
  'the-glow': 'the-glow',
  'the-canvas': 'the-canvas',
  'soulstice': 'soulstice',
  'dig-deep': 'dig-deep',
};

export function SuggestedMomentCard({ type, item, reason, onStart }: SuggestedMomentCardProps) {
  const isEvent = type === 'event';
  const event = isEvent ? (item as AmoraEvent) : null;
  const activity = !isEvent ? (item as Activity) : null;

  const getIconId = (): string => {
    if (isEvent && event) {
      return event.stampIconId;
    }
    if (activity) {
      return milestoneIconMap[activity.milestoneId] || 'sparkles';
    }
    return 'sparkles';
  };

  return (
    <Card className="overflow-hidden border border-primary/20 bg-card shadow-card">
      <CardContent className="p-0">
        {/* Header accent */}
        <div className="bg-primary/10 px-5 py-3 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Suggested Next Moment
            </span>
          </div>
          {isEvent && (
            <Badge variant="secondary" className="bg-gold/20 text-gold-dark text-xs border-0">
              Live Experience
            </Badge>
          )}
        </div>
        
        <div className="p-5 space-y-4">
          {/* Title & Icon */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <MilestoneIcon iconId={getIconId()} className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
                {isEvent ? event?.name : activity?.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {isEvent ? event?.description : activity?.description}
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {isEvent && event && (
              <>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(event.date, 'MMM d')}</span>
                </div>
              </>
            )}
            {activity && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{activity.duration}</span>
              </div>
            )}
          </div>

          {/* Personalization reason */}
          <div className="bg-muted/50 rounded-xl px-4 py-3">
            <p className="text-sm text-muted-foreground italic">
              "{reason}"
            </p>
          </div>

          {/* CTA */}
          <Button
            variant="gold"
            size="lg"
            className="w-full group"
            onClick={onStart}
          >
            {isEvent ? 'View Event Details' : 'Start This Moment'}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
