import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ChevronLeft } from 'lucide-react';
import { UserProfile } from '@/types/amora';

interface PassportSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function PassportSetup({ onComplete, onBack }: PassportSetupProps) {
  const [coupleName, setCoupleName] = useState('');
  const [relationshipStage, setRelationshipStage] = useState<string>('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupleName.trim()) {
      onComplete({
        coupleName: coupleName.trim(),
        relationshipStage: relationshipStage as UserProfile['relationshipStage'],
        startDate: startDate ? new Date(startDate) : new Date(),
      });
    }
  };

  return (
    <div className="min-h-screen gradient-blush flex flex-col">
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
      <div className="flex-1 px-6 pb-6">
        {/* Passport visual */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-48 h-64 rounded-2xl gradient-sunset shadow-elevated flex flex-col items-center justify-center p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-primary-foreground fill-current" />
              </div>
              <div className="text-primary-foreground text-center">
                <p className="text-xs uppercase tracking-widest opacity-80">Love Passport</p>
                <p className="font-serif text-lg font-semibold mt-1">
                  {coupleName || 'Your Names'}
                </p>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1 bg-primary-foreground/30 rounded-full" />
              </div>
            </div>
            {/* Stamp preview */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full gradient-stamp shadow-stamp flex items-center justify-center transform -rotate-12 animate-pulse-soft">
              <span className="text-2xl">💝</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
          <div className="space-y-2">
            <Label htmlFor="coupleName" className="text-foreground font-medium">
              Your couple name
            </Label>
            <Input
              id="coupleName"
              placeholder="e.g. Alex & Jordan"
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              className="h-14 text-lg bg-card border-border rounded-2xl px-5"
            />
            <p className="text-sm text-muted-foreground">
              This is how your passport will identify you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="text-foreground font-medium">
              Relationship stage
            </Label>
            <Select value={relationshipStage} onValueChange={setRelationshipStage}>
              <SelectTrigger className="h-14 text-lg bg-card border-border rounded-2xl px-5">
                <SelectValue placeholder="Select your stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="long-term">Long-term</SelectItem>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="married">Married</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-foreground font-medium">
              When did your journey begin?
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-14 text-lg bg-card border-border rounded-2xl px-5"
            />
            <p className="text-sm text-muted-foreground">Optional • Celebrate your milestones</p>
          </div>
        </form>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={handleSubmit}
          disabled={!coupleName.trim()}
        >
          Create Passport
        </Button>
      </div>
    </div>
  );
}
