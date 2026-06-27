import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface SignupScreenProps {
  onComplete: () => void;
  onBack: () => void;
  coupleName: string;
}

export function SignupScreen({ onComplete, onBack, coupleName }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Check your email to verify.');
        onComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = email.length > 0 && password.length >= 6 && password === confirmPassword && !isLoading;

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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
          <div key={i} className="w-6 h-1 rounded-full bg-gold/80" />
          )}
          <div className="w-6 h-1 rounded-full bg-gold" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-wine-dark flex items-center justify-center mx-auto mb-4 shadow-card border border-blush/20">
            <Heart className="w-8 h-8 text-blush fill-current" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-2">
            Save your journey
          </h1>
          <p className="text-cream/70">
            Create an account to access {coupleName}'s passport anytime
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full flex-1">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cream/80">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-12 h-14 bg-cream/10 border-cream/20 rounded-2xl text-cream placeholder:text-cream/40"
                disabled={isLoading} />
              
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cream/80">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 bg-cream/10 border-cream/20 rounded-2xl text-cream placeholder:text-cream/40"
                disabled={isLoading} />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream transition-colors">
                
                {showPassword ?
                <EyeOff className="w-5 h-5" /> :

                <Eye className="w-5 h-5" />
                }
              </button>
            </div>
            <p className="text-xs text-cream/50">
              Must be at least 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-cream/80">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 h-14 bg-cream/10 border-cream/20 rounded-2xl text-cream placeholder:text-cream/40"
                disabled={isLoading} />
              
            </div>
            {confirmPassword && password !== confirmPassword &&
            <p className="text-xs text-red-400">
                Passwords do not match
              </p>
            }
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </form>

        {/* Bottom CTA */}
        <div className="max-w-sm mx-auto w-full mt-auto pt-6 safe-bottom">
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={!canSubmit}>
            
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </div>
    </div>);

}