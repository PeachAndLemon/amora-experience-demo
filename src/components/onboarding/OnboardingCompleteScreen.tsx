import { Button } from '@/components/ui/button';
import { Heart, Compass, Sparkles } from 'lucide-react';

interface OnboardingCompleteScreenProps {
  onStart: () => void;
  coupleName?: string;
}

export function OnboardingCompleteScreen({ onStart, coupleName }: OnboardingCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-wine flex flex-col items-center justify-center p-6">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-wine-dark flex items-center justify-center animate-pulse-soft shadow-glow border border-blush/20">
          <Heart className="w-14 h-14 text-blush fill-current" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-stamp animate-float">
          <Compass className="w-5 h-5 text-wine" />
        </div>
        <Sparkles className="absolute -bottom-1 -left-3 w-6 h-6 text-gold animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-cream text-center mb-4">Your journey begins.</h1>
      <p className="text-cream/70 text-center text-lg max-w-sm mb-2">Your Love Passport is ready.</p>

      {coupleName && (
        <p className="text-gold font-medium text-center mb-8 flex items-center gap-2">
          <Heart className="w-4 h-4 fill-current" />
          {coupleName}
        </p>
      )}

      <div className="flex gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-blush animate-pulse-soft" />
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-blush animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
      </div>

      <Button variant="gold" size="xl" className="w-full max-w-sm" onClick={onStart}>Enter Journey</Button>
    </div>
  );
}
