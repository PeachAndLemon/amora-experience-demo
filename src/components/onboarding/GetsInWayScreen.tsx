import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Brain, Smartphone, RefreshCw, Home } from 'lucide-react';
import { GetsInWay } from '@/types/amora';

const getsInWayOptions: {id: GetsInWay;label: string;icon: React.ReactNode;}[] = [
{ id: 'mental-overload', label: 'Mental overload', icon: <Brain className="w-5 h-5" /> },
{ id: 'screens-distraction', label: 'Screens & distraction', icon: <Smartphone className="w-5 h-5" /> },
{ id: 'same-routine', label: 'Same-old routine', icon: <RefreshCw className="w-5 h-5" /> },
{ id: 'side-by-side', label: 'Living side-by-side but not together', icon: <Home className="w-5 h-5" /> }];


interface GetsInWayScreenProps {
  onComplete: (getsInWay: GetsInWay[]) => void;
  onBack: () => void;
  initialValue?: GetsInWay[];
}

export function GetsInWayScreen({ onComplete, onBack, initialValue = [] }: GetsInWayScreenProps) {
  const [selected, setSelected] = useState<GetsInWay[]>(initialValue);

  const toggleOption = (id: GetsInWay) => {
    setSelected((prev) =>
    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#91032e]">
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />)}
          {[8, 9, 10].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-cream/20" />)}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="text-center mb-2">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">What usually pulls you apart?</h1>
          <p className="text-cream/60 text-sm">Select all that apply</p>
        </div>

        <div className="space-y-3 max-w-md mx-auto mt-6">
          {getsInWayOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button key={option.id} onClick={() => toggleOption(option.id)} className={`w-full relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${isSelected ? 'bg-blush shadow-card border border-gold/30' : 'bg-cream/10 hover:bg-cream/15 border border-transparent'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-wine/10' : 'bg-cream/10'}`}>
                  <span className={isSelected ? 'text-wine' : 'text-cream/70'}>{option.icon}</span>
                </div>
                <span className={`flex-1 font-medium ${isSelected ? 'text-wine' : 'text-cream/90'}`}>{option.label}</span>
                {isSelected && <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center"><Check className="w-4 h-4 text-wine" /></div>}
              </button>);

          })}
        </div>
      </div>

      <div className="p-6 safe-bottom">
        <Button variant="gold" size="xl" className="w-full" onClick={() => onComplete(selected)} disabled={selected.length === 0}>Continue</Button>
      </div>
    </div>);

}