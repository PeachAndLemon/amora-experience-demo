import { useEffect, useState } from 'react';

interface JourneyProgressRingProps {
  progress: number;
  level: number;
  nextMilestone: string;
}

export function JourneyProgressRing({ progress, level, nextMilestone }: JourneyProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Background ring */}
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--coral))" />
            <stop offset="100%" stopColor="hsl(var(--rose))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-serif font-bold text-foreground">
          {level}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Level
        </span>
      </div>

      {/* Next milestone label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-xs text-muted-foreground">
          Next: <span className="text-primary font-medium">{nextMilestone}</span>
        </p>
      </div>
    </div>
  );
}
