import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle } from 'lucide-react';

interface PartnerConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partnerName: string;
  mode: 'send' | 'accept';
  isLoading?: boolean;
}

export function PartnerConsentDialog({
  open,
  onClose,
  onConfirm,
  partnerName,
  mode,
  isLoading = false,
}: PartnerConsentDialogProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleClose = () => {
    setConsentChecked(false);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    setConsentChecked(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {mode === 'send' ? 'Send Link Request' : 'Accept Link Request'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {mode === 'send'
              ? `You're about to send a partner link request to ${partnerName}.`
              : `${partnerName} wants to link their account with yours.`}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">Privacy Notice</p>
              <p className="text-muted-foreground leading-relaxed">
                Linking accounts grants your partner access to shared journey data including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                <li>Shared milestones & stamps</li>
                <li>Event check-in history</li>
                <li>Shared rewards progress</li>
              </ul>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer py-2">
          <Checkbox
            checked={consentChecked}
            onCheckedChange={(checked) => setConsentChecked(checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-foreground leading-relaxed">
            I understand the privacy implications and consent to sharing my relationship journey data with{' '}
            <strong>{partnerName}</strong>.
          </span>
        </label>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!consentChecked || isLoading}>
            {isLoading
              ? 'Processing...'
              : mode === 'send'
              ? 'Send Request'
              : 'Accept & Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
