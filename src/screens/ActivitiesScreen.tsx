import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { EventCard } from '@/components/activities/EventCard';
import { useRankedEvents } from '@/hooks/useRankedEvents';
import { useAmora } from '@/contexts/AmoraContext';
import { useAdminContent } from '@/hooks/useAdminContent';
import { ActivityFeedback } from '@/types/amora';
import { Sparkles, MapPin, MessageCircle, Users, Palette, Wind, Star } from 'lucide-react';

interface ActivitiesScreenProps {
  onStartActivity: (id: string) => void;
  onSelectEvent: (eventId: string) => void;
  prioritizesEvents?: boolean;
  feedback?: ActivityFeedback[];
}

type FilterType = 'all' | 'events' | 'conversation' | 'physical' | 'creative' | 'mindfulness';

const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Star className="w-4 h-4" /> },
  { id: 'events', label: 'Live', icon: <MapPin className="w-4 h-4" /> },
  { id: 'conversation', label: 'Talk', icon: <MessageCircle className="w-4 h-4" /> },
  { id: 'physical', label: 'Move', icon: <Users className="w-4 h-4" /> },
  { id: 'creative', label: 'Create', icon: <Palette className="w-4 h-4" /> },
  { id: 'mindfulness', label: 'Breathe', icon: <Wind className="w-4 h-4" /> },
];

export function ActivitiesScreen({ 
  onStartActivity, 
  onSelectEvent, 
  prioritizesEvents = true,
  feedback = []
}: ActivitiesScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { coupleGoals } = useAmora();
  const { activities, events } = useAdminContent();

  // Get ranked events with recommendation status
  const rankedEvents = useRankedEvents(coupleGoals, feedback, events, activities);
  
  const activeEvents = useMemo(() => 
    rankedEvents.filter(r => r.event.isActive), 
    [rankedEvents]
  );

  const filteredActivities = useMemo(() => 
    activities.filter((a) => 
      activeFilter === 'all' || activeFilter === 'events' || a.type === activeFilter
    ),
    [activeFilter, activities]
  );

  const showEvents = activeFilter === 'all' || activeFilter === 'events';
  const showActivities = activeFilter !== 'events';

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Activities" />

      <main className="px-6 py-6 space-y-6">
        {/* Hero callout for events */}
        {prioritizesEvents && activeFilter === 'all' && activeEvents.length > 0 && (
          <div className="bg-blush rounded-2xl p-5 border border-wine/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-wine flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-cream" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Step away from your screens</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeEvents.length} live experience{activeEvents.length > 1 ? 's' : ''} waiting for you to show up together
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter.id
                  ? filter.id === 'events' 
                    ? 'bg-wine text-cream shadow-soft'
                    : 'bg-wine text-cream shadow-soft'
                  : 'bg-blush text-wine hover:bg-blush-dark'
              }`}
            >
              {filter.icon}
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Events section */}
        {showEvents && activeEvents.length > 0 && (
          <section className="space-y-4">
            {activeFilter === 'all' && (
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-semibold text-foreground">Live Experiences</h2>
                <span className="bg-wine/10 text-wine text-xs font-semibold px-2 py-0.5 rounded-full">
                  In Person
                </span>
              </div>
            )}
            <div className="space-y-4">
              {activeEvents.map(({ event, isRecommended }) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={() => onSelectEvent(event.id)}
                  isRecommended={isRecommended}
                />
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        {showEvents && showActivities && activeFilter === 'all' && activeEvents.length > 0 && (
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">In-App Activities</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Activity list */}
        {showActivities && (
          <div className="space-y-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onStart={() => onStartActivity(activity.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Star className="w-8 h-8 text-gold mx-auto mb-3" />
                <p className="text-muted-foreground">No activities in this category yet</p>
              </div>
            )}
          </div>
        )}

        {/* Events-only empty state */}
        {activeFilter === 'events' && activeEvents.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-8 h-8 text-wine mx-auto mb-3" />
            <p className="text-muted-foreground">No live events available right now</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for upcoming experiences</p>
          </div>
        )}
      </main>
    </div>
  );
}
