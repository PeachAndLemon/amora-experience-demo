import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AmoraEvent } from '@/types/amora';
import { Check, Sparkles, BookOpen } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';

interface StampRevealModalProps {
  event: AmoraEvent;
  onClose: () => void;
  onViewPassport: () => void;
}

export function StampRevealModal({ event, onClose, onViewPassport }: StampRevealModalProps) {
  const [showStamp, setShowStamp] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Stagger animations
    const stampTimer = setTimeout(() => setShowStamp(true), 300);
    const contentTimer = setTimeout(() => setShowContent(true), 800);

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Celebration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `hsl(${12 + Math.random() * 30} 70% ${60 + Math.random() * 20}%)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        {/* Success badge */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Check-in verified
            </span>
          </div>
        </div>

        {/* Stamp animation */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-full bg-gold/30 blur-2xl transition-all duration-1000 ${
              showStamp ? 'opacity-100 scale-150' : 'opacity-0 scale-100'
            }`}
          />

          {/* Passport book */}
          <div
            className={`relative w-48 h-64 rounded-2xl gradient-sunset shadow-elevated transition-all duration-500 ${
              showStamp ? 'scale-100' : 'scale-110'
            }`}
          >
            {/* Book spine line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-primary-foreground/20 rounded-full" />

            {/* Stamp slot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-24 h-24 rounded-full gradient-stamp shadow-stamp flex items-center justify-center transition-all duration-500 ${
                  showStamp
                    ? 'opacity-100 scale-100 rotate-0'
                    : 'opacity-0 scale-200 -rotate-12'
                }`}
                style={{
                  animation: showStamp ? 'stampIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                }}
              >
                <MilestoneIcon iconId={event.stampIconId} className="w-10 h-10 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Sparkles */}
          {showStamp && (
            <>
              <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-gold animate-pulse-soft" />
              <Sparkles className="absolute -top-2 -right-6 w-6 h-6 text-coral animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="absolute -bottom-4 left-1/2 w-5 h-5 text-rose animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
            </>
          )}
        </div>

        {/* Text content */}
        <div
          className={`transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
            +1 Stamp Collected
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            {event.stampName}
          </h1>
          <p className="text-muted-foreground mb-6">
            {event.name} at {event.venue}
          </p>

          {/* Milestone progress */}
          <div className="bg-card rounded-2xl p-4 shadow-soft max-w-xs mx-auto">
            <p className="text-sm text-muted-foreground mb-1">
              This experience strengthened your
            </p>
            <p className="font-semibold text-foreground">
              {event.milestoneCategory} milestone
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`p-6 safe-bottom space-y-3 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Button variant="sunset" size="xl" className="w-full" onClick={onViewPassport}>
          <BookOpen className="w-5 h-5 mr-2" />
          View Passport
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
          Continue Journey
        </Button>
      </div>
    </div>
  );
}
