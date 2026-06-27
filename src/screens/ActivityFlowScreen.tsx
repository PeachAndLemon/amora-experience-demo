import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, ChevronRight, Pause, Check, Plane } from 'lucide-react';
import { Activity, PreferenceSignal } from '@/types/amora';
import { ActivityFeedbackModal } from '@/components/feedback/ActivityFeedbackModal';

interface ActivityFlowScreenProps {
  activity: Activity;
  onComplete: (rating?: number, signals?: PreferenceSignal[]) => void;
  onClose: () => void;
}

export function ActivityFlowScreen({ activity, onComplete, onClose }: ActivityFlowScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [reflection, setReflection] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const prompts = activity.prompts || [
    'Take a moment to connect with your partner...',
    'Share your thoughts openly...',
    'Reflect on what you learned...',
  ];

  const handleNext = () => {
    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleContinueToFeedback = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (rating: number, signals: PreferenceSignal[]) => {
    onComplete(rating, signals);
  };

  const handleFeedbackSkip = () => {
    onComplete();
  };

  // Show feedback modal
  if (showFeedback) {
    return (
      <ActivityFeedbackModal
        activityTitle={activity.title}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleFeedbackSkip}
      />
    );
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Celebration */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full gradient-stamp flex items-center justify-center mb-6 animate-stamp-in shadow-stamp">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Beautiful!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            You've completed "{activity.title}"
          </p>

          {/* Reflection input */}
          <div className="w-full max-w-sm mb-8">
            <label className="block text-sm font-medium text-foreground mb-2 text-left">
              Any reflections to save? (Optional)
            </label>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did this moment mean to you?"
              className="min-h-24 bg-card border-border rounded-2xl"
            />
          </div>

          {/* Reward preview */}
          <div className="bg-secondary/50 rounded-2xl p-4 mb-8 max-w-sm w-full">
            <p className="text-sm text-muted-foreground mb-1">Earned:</p>
            <p className="font-semibold text-foreground">+1 Stamp toward Dig Deep</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 safe-bottom space-y-3">
          <Button variant="sunset" size="xl" className="w-full" onClick={handleContinueToFeedback}>
            Continue Journey
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        {/* Progress */}
        <div className="flex gap-1">
          {prompts.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <button className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors">
          <Pause className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Airplane mode reminder */}
      <div className="mx-6 mb-4">
        <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full justify-center">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Airplane mode recommended</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div key={currentStep} className="animate-fade-in">
          <p className="text-sm text-primary font-medium mb-4 uppercase tracking-wider">
            {activity.type}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground leading-relaxed max-w-md">
            {prompts[currentStep]}
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 safe-bottom">
        <Button
          variant="sunset"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          {currentStep < prompts.length - 1 ? (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            'Complete Activity'
          )}
        </Button>
      </div>
    </div>
  );
}
