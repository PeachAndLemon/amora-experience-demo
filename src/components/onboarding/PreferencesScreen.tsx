import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';

const preferences = [
  { id: 'communication', label: 'Communication', icon: '💬', description: 'Deeper conversations' },
  { id: 'trust', label: 'Trust', icon: '🏰', description: 'Building safety' },
  { id: 'creativity', label: 'Creativity', icon: '🎨', description: 'Making together' },
  { id: 'physical', label: 'Physical Connection', icon: '🤝', description: 'Touch & closeness' },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘', description: 'Being present' },
  { id: 'gratitude', label: 'Gratitude', icon: '🌱', description: 'Appreciation' },
];

interface PreferencesScreenProps {
  onComplete: (selectedPreferences: string[]) => void;
  onBack: () => void;
}

export function PreferencesScreen({ onComplete, onBack }: PreferencesScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePreference = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

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
        <button
          onClick={() => onComplete(selected)}
          className="text-primary text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            What matters most to you?
          </h1>
          <p className="text-muted-foreground">
            We'll personalize your journey based on your priorities
          </p>
        </div>

        {/* Preference chips */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {preferences.map((pref) => {
            const isSelected = selected.includes(pref.id);
            return (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
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
                <span className="text-2xl mb-2 block">{pref.icon}</span>
                <h3
                  className={`font-semibold text-sm ${
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {pref.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pref.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selection hint */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Select as many as you'd like
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={() => onComplete(selected)}
        >
          Start Our Journey
        </Button>
      </div>
    </div>
  );
}
