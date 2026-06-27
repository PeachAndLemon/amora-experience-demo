import { Milestone } from '@/types/amora';
import { Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface MilestoneTileProps {
  milestone: Milestone;
  onClick: () => void;
}

export function MilestoneTile({ milestone, onClick }: MilestoneTileProps) {
  const colorClasses = {
    coral: 'from-wine to-wine-dark',
    rose: 'from-wine-light to-wine',
    gold: 'from-gold to-gold-dark',
  };

  if (!milestone.isUnlocked) {
    return (
      <div className="bg-muted/30 rounded-2xl p-5 border-2 border-dashed border-muted-foreground/20 opacity-60">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground">{milestone.name}</h3>
            <p className="text-sm text-muted-foreground/70">
              Complete more activities to unlock
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 text-left group border border-border/50"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
            colorClasses[milestone.color as keyof typeof colorClasses] || colorClasses.coral
          } flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}
        >
          <MilestoneIcon iconId={milestone.iconId} className="w-7 h-7 text-primary-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground truncate">{milestone.name}</h3>
            <span className="text-sm text-muted-foreground">
              {milestone.completedActivities}/{milestone.totalActivities}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {milestone.description}
          </p>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                colorClasses[milestone.color as keyof typeof colorClasses] || colorClasses.coral
              } rounded-full transition-all duration-500`}
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Quick action */}
      {milestone.progress > 0 && milestone.progress < 100 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="blush" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
            Continue Activity
          </Button>
        </div>
      )}
    </button>
  );
}
