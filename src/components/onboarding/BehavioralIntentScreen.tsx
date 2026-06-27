import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { BehavioralIntent } from '@/types/amora';

const intentOptions: { id: BehavioralIntent; label: string; icon: string }[] = [
  { id: 'try-new-experiences', label: 'Try new experiences', icon: '🌟' },
  { id: 'meaningful-topics', label: 'Talk about meaningful topics', icon: '💭' },
  { id: 'laugh-more', label: 'Laugh more', icon: '😄' },
  { id: 'slow-down-present', label: 'Slow down and be present', icon: '🧘' },
  { id: 'create-together', label: 'Create something together', icon: '🎨' },
  { id: 'shared-goals', label: 'Work toward shared goals', icon: '🎯' },
  { id: 'reconnect-physically', label: 'Reconnect physically', icon: '💕' },
];

interface BehavioralIntentScreenProps {
  onComplete: (selected: BehavioralIntent[], freeText?: string) => void;
  onBack: () => void;
}

export function BehavioralIntentScreen({ onComplete, onBack }: BehavioralIntentScreenProps) {
  const [selected, setSelected] = useState<BehavioralIntent[]>([]);
  const [freeText, setFreeText] = useState('');

  const toggleOption = (id: BehavioralIntent) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-muted" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Something I'd love us to do more of together is…
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {intentOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
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

        {/* Optional text input */}
        <div className="max-w-md mx-auto mt-6">
          <label className="block text-sm text-muted-foreground mb-2">
            Anything else you want more of? (optional)
          </label>
          <Textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value.slice(0, 150))}
            placeholder="One sentence max..."
            className="bg-card border-border resize-none"
            rows={2}
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {freeText.length}/150
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={() => onComplete(selected, freeText || undefined)}
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
