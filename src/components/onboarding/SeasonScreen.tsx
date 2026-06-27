import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Hammer, Users, Sparkles } from 'lucide-react';
import { RelationshipSeason } from '@/types/amora';

const seasonOptions: {id: RelationshipSeason;label: string;icon: React.ReactNode;}[] = [
{ id: 'building', label: 'Building — laying your foundation', icon: <Hammer className="w-5 h-5" /> },
{ id: 'committed', label: 'Committed — growing as a team', icon: <Users className="w-5 h-5" /> },
{ id: 'established', label: 'Established — keeping the spark alive', icon: <Sparkles className="w-5 h-5" /> }];


interface SeasonScreenProps {
  onComplete: (season: RelationshipSeason) => void;
  onBack: () => void;
  initialValue?: RelationshipSeason | null;
}

export function SeasonScreen({ onComplete, onBack, initialValue }: SeasonScreenProps) {
  const [selected, setSelected] = useState<RelationshipSeason | null>(initialValue || null);

  return (
    <div className="min-h-screen flex flex-col bg-[#91032e]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) =>
          <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />
          )}
          {[4, 5, 6, 7, 8, 9, 10].map((i) =>
          <div key={i} className="w-6 h-1 rounded-full bg-cream/20" />
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">
            What season are you in?
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {seasonOptions.map((option) => {
            const isSelected = selected === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`w-full relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${
                isSelected ?
                'bg-blush shadow-card border border-gold/30' :
                'bg-cream/10 hover:bg-cream/15 border border-transparent'}`
                }>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-wine/10' : 'bg-cream/10'}`
                }>
                  <span className={isSelected ? 'text-wine' : 'text-cream/70'}>
                    {option.icon}
                  </span>
                </div>
                <span
                  className={`flex-1 font-medium ${
                  isSelected ? 'text-wine' : 'text-cream/90'}`
                  }>
                  
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

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}>
          
          Continue
        </Button>
      </div>
    </div>);

}