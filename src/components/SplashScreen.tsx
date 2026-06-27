import { BookHeart } from 'lucide-react';
import amoraLogoWhite from '@/assets/amora-logo-white.png';
export const SplashScreen = () => {
  return <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-wine">
      {/* Subtle flowing light streak - silk/river effect */}
      <div className="absolute inset-0 opacity-20 bg-[#91032e]" style={{
      background: `
            radial-gradient(ellipse 120% 60% at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 70% 60%, rgba(255,255,255,0.08) 0%, transparent 40%)
          `
    }} />
      
      {/* Centered content */}
      <div className="relative z-10 flex-col gap-10 flex items-center justify-center">
        {/* Passport icon - white, minimal */}
        <BookHeart className="h-14 w-16 text-white" strokeWidth={1.2} />
        
        {/* Amora logo - exact provided asset */}
        <img alt="Amora" className="h-32 w-auto " src="/lovable-uploads/b17983ed-0429-4535-be85-7cefdf6e50e6.png" />
      </div>
    </div>;
};