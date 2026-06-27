import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Heart, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function LoginScreen({ onLogin, onBack, isLoading: externalLoading = false }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
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

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Check your email to verify your account!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          onLogin(email, password);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;
  const canSubmit = email.length > 0 && password.length >= 6 && !loading;

  return (
    <div className="min-h-screen bg-wine-radial flex flex-col">
      {/* Header */}
      <div className="flex items-center p-6 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-wine flex items-center justify-center mx-auto mb-4 shadow-card">
            <Heart className="w-8 h-8 text-primary-foreground fill-current" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Start your journey together' : 'Log in to continue your journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full flex-1">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-12 h-14 bg-card border-border rounded-2xl"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 bg-card border-border rounded-2xl"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {/* Toggle login/signup */}
          <button
            type="button"
            className="text-sm text-primary hover:underline flex items-center gap-1"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            <UserPlus className="w-4 h-4" />
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>

          {/* Forgot password */}
          {!isSignUp && (
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
              onClick={async () => {
                if (!email || !email.includes('@')) {
                  toast.error('Please enter your email address first');
                  return;
                }
                setIsLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                setIsLoading(false);
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success('Password reset email sent! Check your inbox.');
                }
              }}
            >
              Forgot your password?
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </form>

        {/* Bottom CTA */}
        <div className="max-w-sm mx-auto w-full mt-auto pt-6 safe-bottom">
          <Button
            variant="sunset"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Log In')}
          </Button>
        </div>
      </div>
    </div>
  );
}
