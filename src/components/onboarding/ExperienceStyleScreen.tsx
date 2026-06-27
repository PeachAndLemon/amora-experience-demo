import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { ExperienceStyle } from '@/types/amora';

const styleOptions: { id: ExperienceStyle; label: string; icon: string; description: string }[] = [
  { id: 'light-fun', label: 'Light and fun', icon: '🎈', description: 'Laughter and joy' },
  { id: 'deep-meaningful', label: 'Deep and meaningful', icon: '🌙', description: 'Heart-to-heart' },
  { id: 'calm-grounding', label: 'Calm and grounding', icon: '🍃', description: 'Peaceful presence' },
  { id: 'playful-adventurous', label: 'Playful and adventurous', icon: '🎢', description: 'New experiences' },
  { id: 'creative-expressive', label: 'Creative and expressive', icon: '🎨', description: 'Making together' },
  { id: 'romantic-intimate', label: 'Romantic and intimate', icon: '🌹', description: 'Close connection' },
];

interface ExperienceStyleScreenProps {
  onComplete: (selected: ExperienceStyle) => void;
  onBack: () => void;
}

export function ExperienceStyleScreen({ onComplete, onBack }: ExperienceStyleScreenProps) {
  const [selected, setSelected] = useState<ExperienceStyle | null>(null);

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
          <div className="w-8 h-1 rounded-full bg-primary" />
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
            When we spend intentional time together, I want it to feel…
          </h1>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {styleOptions.map((option) => {
            const isSelected = selected === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-card shadow-card border-2 border-primary'
                    : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <span className="text-2xl mb-2 block">{option.icon}</span>
                <h3
                  className={`font-semibold text-sm ${
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
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
