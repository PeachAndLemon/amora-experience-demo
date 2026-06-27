import { Button } from '@/components/ui/button';
import { Heart, Compass } from 'lucide-react';
interface WelcomeScreenProps {
  onStart: () => void;
  onExisting: () => void;
}
export function WelcomeScreen({
  onStart,
  onExisting
}: WelcomeScreenProps) {
  return <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#91032e]">
      {/* Subtle decorative elements - no gradients, just soft glow */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl bg-[#91032e]" />
      <div className="absolute bottom-32 right-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl" />

      {/* Logo */}
      <div className="relative mb-8 animate-float">
        <div className="w-28 h-28 rounded-full bg-wine-dark flex items-center justify-center shadow-glow border border-blush/20">
          <Heart className="w-14 h-14 text-blush fill-current" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-stamp">
          <Compass className="w-5 h-5 text-wine" />
        </div>
      </div>

      {/* Brand name */}
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-2 text-center">The Amora Experience</h1>
      
      {/* Tagline */}
      <p className="text-cream/70 text-lg text-center max-w-xs mb-12 mt-4">  Your curated passport to deeper connection. </p>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm space-y-4">
        <Button variant="gold" size="xl" className="w-full" onClick={onStart}>
          Start
        </Button>

        <Button variant="ghost" size="lg" className="w-full text-cream/60 hover:text-cream hover:bg-cream/10" onClick={onExisting}>
          I already have one
        </Button>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-sm text-cream/40 text-center flex items-center gap-2">
        <Compass className="w-4 h-4" />
        Switch to Airplane Mode
      </p>
    </div>;
}