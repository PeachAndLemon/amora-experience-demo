import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { CurrentDynamic } from '@/types/amora';

const dynamicOptions: { id: CurrentDynamic; label: string; icon: string }[] = [
  { id: 'content-wanting-depth', label: 'Content, but wanting more depth', icon: '🌊' },
  { id: 'little-disconnected', label: 'A little disconnected', icon: '🔌' },
  { id: 'busy-out-of-sync', label: 'Busy and out of sync', icon: '⏳' },
  { id: 'stuck-in-routine', label: 'Stuck in a routine', icon: '🔄' },
  { id: 'excited-wanting-direction', label: 'Excited, but wanting direction', icon: '🧭' },
  { id: 'hoping-for-reset', label: 'Hoping for a reset', icon: '🌅' },
];

interface CurrentDynamicScreenProps {
  onComplete: (selected: CurrentDynamic) => void;
  onBack: () => void;
}

export function CurrentDynamicScreen({ onComplete, onBack }: CurrentDynamicScreenProps) {
  const [selected, setSelected] = useState<CurrentDynamic | null>(null);

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
          <div className="w-8 h-1 rounded-full bg-primary" />
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
            Lately, I've been feeling…
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {dynamicOptions.map((option) => {
            const isSelected = selected === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-card shadow-card border-2 border-primary'
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
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
