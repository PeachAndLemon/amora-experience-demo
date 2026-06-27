import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Check, Shield, ClipboardList, Lightbulb, Sofa, MessageCircle } from 'lucide-react';
import { RichIn } from '@/types/amora';

const richInOptions: {id: RichIn;label: string;icon: React.ReactNode;}[] = [
{ id: 'trust-reliability', label: 'Trust & reliability', icon: <Shield className="w-5 h-5" /> },
{ id: 'life-logistics', label: 'Life logistics', icon: <ClipboardList className="w-5 h-5" /> },
{ id: 'ideas-ambition', label: 'Ideas & goals', icon: <Lightbulb className="w-5 h-5" /> },
{ id: 'comfort-familiarity', label: 'Comfort & familiarity', icon: <Sofa className="w-5 h-5" /> },
{ id: 'other', label: 'Other (tell us in your own words)', icon: <MessageCircle className="w-5 h-5" /> }];


interface RichInScreenProps {
  onComplete: (richIn: RichIn, otherText?: string) => void;
  onBack: () => void;
  initialValue?: RichIn | null;
  initialOtherText?: string;
}

export function RichInScreen({ onComplete, onBack, initialValue, initialOtherText }: RichInScreenProps) {
  const [selected, setSelected] = useState<RichIn | null>(initialValue || null);
  const [otherText, setOtherText] = useState(initialOtherText || '');

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'other') {
      onComplete(selected, otherText);
    } else {
      onComplete(selected);
    }
  };

  const isValid = selected && (selected !== 'other' || otherText.trim().length > 0);

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
          {[1, 2, 3, 4, 5].map((i) =>
          <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />
          )}
          {[6, 7, 8, 9, 10].map((i) =>
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
            What's already working beautifully?
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3 max-w-md mx-auto">
          {richInOptions.map((option) => {
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

          {/* Other text input */}
          {selected === 'other' &&
          <div className="mt-4">
              <Input
              type="text"
              placeholder="What's working well for you?"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              className="h-14 text-base bg-cream/10 border-cream/20 rounded-2xl px-5 text-cream placeholder:text-cream/40"
              autoFocus />
            
            </div>
          }
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={handleContinue}
          disabled={!isValid}>
          
          Continue
        </Button>
      </div>
    </div>);

}