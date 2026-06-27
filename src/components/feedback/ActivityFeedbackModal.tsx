import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Check } from 'lucide-react';
import { PreferenceSignal } from '@/types/amora';

interface ActivityFeedbackModalProps {
  activityTitle: string;
  onSubmit: (rating: number, signals: PreferenceSignal[]) => void;
  onSkip: () => void;
}

const preferenceOptions: { id: PreferenceSignal; label: string; description: string }[] = [
  { id: 'more-like-this', label: 'See more like this', description: 'I want similar activities' },
  { id: 'fewer-like-this', label: 'See fewer like this', description: 'Not my preference' },
  { id: 'liked-not-now', label: 'Liked it, not right now', description: 'Good but need variety' },
  { id: 'want-variety', label: 'More variety please', description: 'Mix it up' },
  { id: 'especially-meaningful', label: 'Especially meaningful', description: 'This one mattered' },
  { id: 'fun-but-light', label: 'Fun but light', description: 'Enjoyed, less serious' },
];

export function ActivityFeedbackModal({ activityTitle, onSubmit, onSkip }: ActivityFeedbackModalProps) {
  const [starRating, setStarRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedSignals, setSelectedSignals] = useState<PreferenceSignal[]>([]);
  const [step, setStep] = useState<'stars' | 'signals'>('stars');

  const toggleSignal = (signal: PreferenceSignal) => {
    setSelectedSignals(prev => 
      prev.includes(signal) 
        ? prev.filter(s => s !== signal)
        : [...prev, signal]
    );
  };

  const handleStarContinue = () => {
    if (starRating > 0) {
      setStep('signals');
    }
  };

  const handleSubmit = () => {
    onSubmit(starRating, selectedSignals);
  };

  if (step === 'stars') {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full gradient-stamp flex items-center justify-center mx-auto mb-4 shadow-stamp">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              How did this moment feel?
            </h2>
            <p className="text-muted-foreground">
              "{activityTitle}"
            </p>
          </div>

          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setStarRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredStar || starRating)
                      ? 'fill-gold text-gold'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="sunset"
              size="lg"
              className="w-full"
              onClick={handleStarContinue}
              disabled={starRating === 0}
            >
              Continue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={onSkip}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6 animate-fade-in py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= starRating ? 'fill-gold text-gold' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            What would you like going forward?
          </h2>
          <p className="text-sm text-muted-foreground">
            Select any that apply
          </p>
        </div>

        {/* Preference signals */}
        <div className="grid grid-cols-1 gap-3">
          {preferenceOptions.map((option) => {
            const isSelected = selectedSignals.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleSignal(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            variant="sunset"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
          >
            Continue Journey
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={handleSubmit}
          >
            Skip preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
