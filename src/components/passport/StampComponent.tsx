import { Stamp } from '@/types/amora';
import { Lock } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface StampComponentProps {
  stamp: Stamp;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function StampComponent({ stamp, size = 'md', showAnimation = false }: StampComponentProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  if (!stamp.isEarned) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}
      >
        <Lock className="w-1/3 h-1/3 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full gradient-stamp shadow-stamp flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300 ${
        showAnimation ? 'animate-stamp-in' : ''
      }`}
    >
      <MilestoneIcon iconId={stamp.iconId} className={`${iconSizes[size]} text-primary-foreground drop-shadow-sm`} />
    </div>
  );
}
