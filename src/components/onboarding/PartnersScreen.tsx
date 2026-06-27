import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Users } from 'lucide-react';
interface PartnersScreenProps {
  onComplete: (partner1: string, partner2: string) => void;
  onBack: () => void;
  initialPartner1?: string;
  initialPartner2?: string;
}
export function PartnersScreen({
  onComplete,
  onBack,
  initialPartner1 = '',
  initialPartner2 = ''
}: PartnersScreenProps) {
  const [partner1, setPartner1] = useState(initialPartner1);
  const [partner2, setPartner2] = useState(initialPartner2);
  const canContinue = partner1.trim().length > 0 && partner2.trim().length > 0;
  return <div className="min-h-screen flex flex-col bg-[#91032e]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <div className="flex gap-1">
          <div className="w-6 h-1 rounded-full bg-gold/80" />
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="w-6 h-1 rounded-full bg-cream/20" />)}
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blush/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-blush" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">
            Who's on this journey?
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-4 max-w-sm mx-auto w-full">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cream/80">
              Your Name
            </label>
            <Input value={partner1} onChange={e => setPartner1(e.target.value)} placeholder="First name" className="h-14 bg-cream/10 border-cream/20 rounded-2xl px-5 text-cream placeholder:text-cream/40" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-cream/80">
              Your Partner's Name
            </label>
            <Input value={partner2} onChange={e => setPartner2(e.target.value)} placeholder="First name" className="h-14 bg-cream/10 border-cream/20 rounded-2xl px-5 text-cream placeholder:text-cream/40" />
          </div>
        </div>

        <div className="flex-1" />
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button variant="gold" size="xl" className="w-full" onClick={() => onComplete(partner1.trim(), partner2.trim())} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>;
}