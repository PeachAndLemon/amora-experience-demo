import { useState } from 'react';
import { AmoraEvent } from '@/types/amora';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Sparkles, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface EventCardProps {
  event: AmoraEvent;
  onSelect: () => void;
  isRecommended?: boolean;
}

export function EventCard({ event, onSelect, isRecommended = false }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = event.description.length > 120;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/20 shadow-card hover:shadow-elevated transition-all duration-300">
      {event.imageUrl && (
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}

      <div className="p-5">
        {/* Badges container */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          {isRecommended && (
            <div className="flex items-center gap-1.5 text-wine px-3 py-1 rounded-full text-xs font-semibold shadow-sm border-[#a3192c] border-2 bg-card">
              <Heart className="w-3 h-3" />
              <span>Recommended</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Live Experience</span>
          </div>
        </div>

        {/* Event icon */}
        <div className="w-14 h-14 rounded-xl gradient-stamp flex items-center justify-center mb-4 shadow-stamp">
          <MilestoneIcon iconId={event.stampIconId} className="w-7 h-7 text-primary-foreground" />
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {event.milestoneCategory}
          </p>
          <h3 className="font-serif text-xl font-semibold text-foreground">{event.name}</h3>
          <p className={`text-sm text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}>
            {event.description}
          </p>
          {isLongDescription && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-wine hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>See Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>See More <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-gold" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-gold" />
            <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
          </div>
          {expanded && event.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-full">
              <MapPin className="w-4 h-4 text-gold" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button variant="sunset" size="sm" className="w-full" onClick={onSelect}>
          Show Up Together
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-3 italic flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          This experience happens in real life
        </p>
      </div>
    </div>
  );
}
