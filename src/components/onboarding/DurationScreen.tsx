import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Clock } from 'lucide-react';
import { RelationshipDuration } from '@/types/amora';

const durationOptions: {id: RelationshipDuration;label: string;}[] = [
{ id: '0-2', label: '0–2 years' },
{ id: '2-5', label: '2–5 years' },
{ id: '5-10', label: '5–10 years' },
{ id: '10+', label: '10+ years' }];


interface DurationScreenProps {
  onComplete: (duration: RelationshipDuration) => void;
  onBack: () => void;
  initialValue?: RelationshipDuration | null;
}

export function DurationScreen({ onComplete, onBack, initialValue }: DurationScreenProps) {
  const [selected, setSelected] = useState<RelationshipDuration | null>(initialValue || null);

  return (
    <div className="min-h-screen flex flex-col bg-[#91032e]">
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />)}
          {[4, 5, 6, 7, 8, 9, 10].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-cream/20" />)}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blush/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blush" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">
            How long have you been traveling together?
          </h1>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          {durationOptions.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${
                isSelected ? 'bg-blush shadow-card border border-gold/30' : 'bg-cream/10 hover:bg-cream/15 border border-transparent'}`
                }>
                
                <span className={`flex-1 font-medium text-center ${isSelected ? 'text-wine' : 'text-cream/90'}`}>
                  {option.label}
                </span>
                {isSelected &&
                <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <Check className="w-4 h-4 text-wine" />
                  </div>
                }
              </button>);

          })}
        </div>
      </div>

      <div className="p-6 safe-bottom">
        <Button variant="gold" size="xl" className="w-full" onClick={() => selected && onComplete(selected)} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>);

}