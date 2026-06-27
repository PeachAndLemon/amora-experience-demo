import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Heart, Zap, Shield, Compass } from 'lucide-react';
import { DestinationFeeling } from '@/types/amora';

const destinationOptions: {id: DestinationFeeling;label: string;description: string;icon: React.ReactNode;}[] = [
{ id: 'attunement', label: 'Attunement', description: 'feeling in sync', icon: <Heart className="w-5 h-5" /> },
{ id: 'vitality', label: 'Vitality', description: 'spark & energy', icon: <Zap className="w-5 h-5" /> },
{ id: 'safe-haven', label: 'Safe Haven', description: 'peace & comfort', icon: <Shield className="w-5 h-5" /> },
{ id: 'co-adventure', label: 'Co-Adventure', description: 'building something big', icon: <Compass className="w-5 h-5" /> }];


interface DestinationScreenProps {
  onComplete: (destination: DestinationFeeling) => void;
  onBack: () => void;
  initialValue?: DestinationFeeling | null;
}

export function DestinationScreen({ onComplete, onBack, initialValue }: DestinationScreenProps) {
  const [selected, setSelected] = useState<DestinationFeeling | null>(initialValue || null);

  return (
    <div className="min-h-screen flex flex-col bg-[#91032e]">
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />)}
          <div className="w-6 h-1 rounded-full bg-cream/20" />
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="text-center mb-2">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">What feeling do you want more of?</h1>
          <p className="text-cream/60 text-sm">Choose one — together</p>
        </div>

        <div className="space-y-3 max-w-md mx-auto mt-8">
          {destinationOptions.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button key={option.id} onClick={() => setSelected(option.id)} className={`w-full relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${isSelected ? 'bg-blush shadow-card border border-gold/30' : 'bg-cream/10 hover:bg-cream/15 border border-transparent'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-gold/20' : 'bg-cream/10'}`}>
                  <span className={isSelected ? 'text-gold' : 'text-cream/70'}>{option.icon}</span>
                </div>
                <div className="flex-1">
                  <span className={`font-medium block ${isSelected ? 'text-wine' : 'text-cream/90'}`}>{option.label}</span>
                  <span className={`text-sm ${isSelected ? 'text-wine/60' : 'text-cream/50'}`}>{option.description}</span>
                </div>
                {isSelected && <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center"><Check className="w-4 h-4 text-wine" /></div>}
              </button>);

          })}
        </div>
      </div>

      <div className="p-6 safe-bottom">
        <Button variant="gold" size="xl" className="w-full" onClick={() => selected && onComplete(selected)} disabled={!selected}>Continue</Button>
      </div>
    </div>);

}