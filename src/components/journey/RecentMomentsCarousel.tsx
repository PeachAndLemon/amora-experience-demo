import { Activity, PassportData } from '@/types/amora';
import { Check } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

interface RecentMomentsCarouselProps {
  activities: Activity[];
  passportData: PassportData;
}

export function RecentMomentsCarousel({ activities, passportData }: RecentMomentsCarouselProps) {
  const recentMoments = activities.filter(a => a.isCompleted).slice(0, 5);

  if (recentMoments.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2">
        {recentMoments.map((activity) => {
          const milestone = passportData.milestones.find(m => m.id === activity.milestoneId);
          return (
            <CarouselItem key={activity.id} className="pl-2 basis-[140px]">
              <div className="p-3 rounded-xl bg-card border border-border/30 h-full shadow-soft">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  {milestone ? (
                    <MilestoneIcon iconId={milestone.iconId} className="w-4 h-4 text-primary" />
                  ) : (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                  {activity.title}
                </p>
                <div className="flex items-center gap-1 text-gold">
                  <Check className="w-3 h-3" />
                  <span className="text-[10px] font-medium">Done</span>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
