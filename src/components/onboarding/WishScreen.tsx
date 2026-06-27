import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Sparkles } from 'lucide-react';

interface WishScreenProps {
  onComplete: (wish: string) => void;
  onBack: () => void;
  initialValue?: string;
}

export function WishScreen({ onComplete, onBack, initialValue = '' }: WishScreenProps) {
  const [wish, setWish] = useState(initialValue);

  return (
    <div className="min-h-screen flex flex-col bg-[#91032e]">
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />)}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-glow-gold animate-pulse-soft">
            <Sparkles className="w-8 h-8 text-wine" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">What's the one thing you hope Amora helps with?</h1>
        </div>

        <div className="max-w-md mx-auto w-full">
          <Input value={wish} onChange={(e) => setWish(e.target.value)} placeholder="I hope we can..." className="h-14 bg-cream/10 border-cream/20 rounded-2xl px-5 text-base text-cream placeholder:text-cream/40" />
        </div>
        <div className="flex-1" />
      </div>

      <div className="p-6 safe-bottom">
        <Button variant="gold" size="xl" className="w-full" onClick={() => onComplete(wish.trim())}>{wish.trim() ? 'Continue' : 'Skip for now'}</Button>
      </div>
    </div>);

}