import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plane, Heart, Sparkles, Gift } from 'lucide-react';

interface Slide {
  icon: React.ReactNode;
  headline: string;
  subtext: string;
}

const slides: Slide[] = [
  {
    icon: <Plane className="w-16 h-16 text-primary" />,
    headline: 'Switch to airplane mode',
    subtext: "It's time to take off into deeper connection.",
  },
  {
    icon: <Heart className="w-16 h-16 text-accent" />,
    headline: 'Escape room meets relationship playground',
    subtext: 'Complete activities and unlock moments of magic together.',
  },
  {
    icon: <Sparkles className="w-16 h-16 text-gold" />,
    headline: 'Collect stamps & milestones',
    subtext: 'Track your journey through trust, communication, creativity, and more.',
  },
  {
    icon: <Gift className="w-16 h-16 text-primary" />,
    headline: 'Earn real rewards together',
    subtext: 'Unlock exclusive experiences and partner perks along the way.',
  },
];

interface StoryCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StoryCarousel({ onComplete, onSkip }: StoryCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen gradient-blush flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-6 safe-top">
        <button
          onClick={onSkip}
          className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div
          key={currentSlide}
          className="flex flex-col items-center text-center animate-fade-in"
        >
          {/* Icon */}
          <div className="mb-8 p-6 rounded-full bg-card shadow-card animate-float">
            {slides[currentSlide].icon}
          </div>

          {/* Headline */}
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-tight">
            {slides[currentSlide].headline}
          </h2>

          {/* Subtext */}
          <p className="text-muted-foreground text-lg max-w-sm">
            {slides[currentSlide].subtext}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary w-8'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            'Create Your Love Passport'
          )}
        </Button>
      </div>
    </div>
  );
}
