import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { GrowthDirection } from '@/types/amora';

const growthOptions: { id: GrowthDirection; label: string; icon: string }[] = [
  { id: 'communication', label: 'Better communication', icon: '💬' },
  { id: 'quality-time', label: 'More quality time', icon: '⏰' },
  { id: 'fun-playfulness', label: 'More fun and playfulness', icon: '🎉' },
  { id: 'emotional-connection', label: 'Deeper emotional connection', icon: '💕' },
  { id: 'physical-closeness', label: 'More physical closeness', icon: '🤝' },
  { id: 'less-stress', label: 'Less stress / more calm', icon: '🧘' },
  { id: 'aligned-future', label: 'Feeling aligned on the future', icon: '🎯' },
  { id: 'feeling-appreciated', label: 'Feeling appreciated', icon: '✨' },
  { id: 'team-again', label: 'Feeling like a team again', icon: '🏆' },
];

interface GrowthDirectionScreenProps {
  onComplete: (selected: GrowthDirection[]) => void;
  onBack: () => void;
}

export function GrowthDirectionScreen({ onComplete, onBack }: GrowthDirectionScreenProps) {
  const [selected, setSelected] = useState<GrowthDirection[]>([]);
  const maxSelections = 3;

  const toggleOption = (id: GrowthDirection) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const canContinue = selected.length > 0;

  return (
    <div className="min-h-screen gradient-blush flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex gap-1">
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-muted" />
          <div className="w-8 h-1 rounded-full bg-muted" />
          <div className="w-8 h-1 rounded-full bg-muted" />
          <div className="w-8 h-1 rounded-full bg-muted" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Right now, I feel our relationship could use more…
          </h1>
          <p className="text-muted-foreground text-sm">
            Choose what feels most important to you right now.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {growthOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            const isDisabled = !isSelected && selected.length >= maxSelections;
            
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                disabled={isDisabled}
                className={`w-full relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-card shadow-card border-2 border-primary'
                    : isDisabled
                    ? 'bg-muted/30 opacity-50 cursor-not-allowed border-2 border-transparent'
                    : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span
                  className={`flex-1 font-medium ${
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection hint */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Select up to {maxSelections} ({selected.length}/{maxSelections} selected)
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={() => onComplete(selected)}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
