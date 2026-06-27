import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { AmoraIntention } from '@/types/amora';

const intentionOptions: { id: AmoraIntention; label: string; icon: string; description: string }[] = [
  { id: 'strengthen-good', label: "Strengthen what's already good", icon: '💪', description: 'Build on our foundation' },
  { id: 'reconnect-busy', label: 'Reconnect during a busy season', icon: '🔗', description: 'Find time for us' },
  { id: 'work-through-stuck', label: 'Work through a stuck feeling', icon: '🚪', description: 'Move forward together' },
  { id: 'better-communication', label: 'Build better communication habits', icon: '💬', description: 'Understand each other' },
  { id: 'meaningful-memories', label: 'Create more meaningful memories', icon: '📸', description: 'Moments that matter' },
  { id: 'grow-intentionally', label: 'Grow together intentionally', icon: '🌱', description: 'Evolve as partners' },
];

interface AmoraIntentionScreenProps {
  onComplete: (selected: AmoraIntention) => void;
  onBack: () => void;
}

export function AmoraIntentionScreen({ onComplete, onBack }: AmoraIntentionScreenProps) {
  const [selected, setSelected] = useState<AmoraIntention | null>(null);

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
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            By using Amora, I'm hoping to…
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {intentionOptions.map((option) => {
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
                <div className="flex-1">
                  <span
                    className={`block font-medium ${
                      isSelected ? 'text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
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
