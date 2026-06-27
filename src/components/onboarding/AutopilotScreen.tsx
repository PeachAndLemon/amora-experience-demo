import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, Gauge } from 'lucide-react';

interface AutopilotScreenProps {
  onComplete: (level: number) => void;
  onBack: () => void;
  initialValue?: number;
}

export function AutopilotScreen({ onComplete, onBack, initialValue = 5 }: AutopilotScreenProps) {
  const [level, setLevel] = useState(initialValue);

  const getLevelLabel = (value: number) => {
    if (value <= 2) return 'Fully present';
    if (value <= 4) return 'Mostly connected';
    if (value <= 6) return 'Sometimes drifting';
    if (value <= 8) return 'Often routine';
    return 'Mostly autopilot';
  };

  return (
    <div className="min-h-screen bg-wine flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />
          ))}
          {[5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="w-6 h-1 rounded-full bg-cream/20" />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blush/20 flex items-center justify-center">
            <Gauge className="w-6 h-6 text-blush" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">
            How "on autopilot" does your relationship feel right now?
          </h1>
          <p className="text-cream/60">
            1 = Fully present &nbsp;&nbsp; 10 = Mostly routine
          </p>
        </div>

        {/* Slider */}
        <div className="max-w-md mx-auto w-full mt-8 px-4">
          <div className="bg-blush rounded-3xl p-8 shadow-card">
            <div className="text-center mb-6">
              <span className="text-5xl font-serif font-bold text-wine">{level}</span>
              <p className="text-wine/70 mt-2 font-medium">{getLevelLabel(level)}</p>
            </div>
            
            <Slider
              value={[level]}
              onValueChange={(value) => setLevel(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between mt-3 text-sm text-wine/50">
              <span>1</span>
              <span>Autopilot Level</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div className="flex-1" />
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={() => onComplete(level)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
