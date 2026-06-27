import { Milestone } from '@/types/amora';
import { Lock, ChevronRight } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface MilestonesSectionProps {
  milestones: Milestone[];
  onMilestoneClick: (id: string) => void;
}

export function MilestonesSection({ milestones, onMilestoneClick }: MilestonesSectionProps) {
  const unlockedMilestones = milestones.filter(m => m.isUnlocked);
  const lockedMilestones = milestones.filter(m => !m.isUnlocked);

  return (
    <div className="space-y-3">
      {unlockedMilestones.map((milestone) => (
        <button
          key={milestone.id}
          onClick={() => onMilestoneClick(milestone.id)}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors text-left shadow-soft"
        >
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MilestoneIcon iconId={milestone.iconId} className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{milestone.name}</p>
            {milestone.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{milestone.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                {milestone.completedActivities}/{milestone.totalActivities}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      ))}

      {lockedMilestones.length > 0 && (
        <div className="pt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Unlocks later
          </p>
          <div className="flex gap-2 flex-wrap">
            {lockedMilestones.slice(0, 3).map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30"
              >
                <MilestoneIcon iconId={milestone.iconId} className="w-4 h-4 text-muted-foreground opacity-50" />
                <span className="text-xs text-muted-foreground">{milestone.name}</span>
              </div>
            ))}
            {lockedMilestones.length > 3 && (
              <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                <span className="text-xs text-muted-foreground">+{lockedMilestones.length - 3} more</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
