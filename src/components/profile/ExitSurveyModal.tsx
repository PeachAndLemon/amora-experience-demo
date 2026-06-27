import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface ExitSurveyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: (reason: string, feedback: string) => void;
  isDeleting: boolean;
}

const exitReasons = [
  { id: 'not-useful', label: "It wasn't useful for us" },
  { id: 'too-complicated', label: 'Too complicated to use' },
  { id: 'no-time', label: "We don't have time" },
  { id: 'relationship-ended', label: 'Our relationship ended' },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'other', label: 'Other reason' },
];

export function ExitSurveyModal({ open, onClose, onConfirmDelete, isDeleting }: ExitSurveyModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'survey' | 'confirm'>('survey');

  const handleContinue = () => {
    if (selectedReason) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    onConfirmDelete(selectedReason || '', feedback);
  };

  const handleClose = () => {
    setStep('survey');
    setSelectedReason(null);
    setFeedback('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'survey' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">We're sorry to see you go</DialogTitle>
              <DialogDescription>
                Help us improve by telling us why you're leaving.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-4">
              {exitReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selectedReason === reason.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {selectedReason && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Anything else you'd like to share? (optional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleContinue}
                disabled={!selectedReason}
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-serif text-center">Delete Account?</DialogTitle>
              <DialogDescription className="text-center">
                This action cannot be undone. All your data, stamps, progress, and memories will be permanently deleted.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep('survey')} disabled={isDeleting}>
                Go Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}