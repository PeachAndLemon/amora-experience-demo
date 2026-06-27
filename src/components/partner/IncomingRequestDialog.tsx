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
import { Heart, Shield, AlertTriangle } from 'lucide-react';
import { PartnerLinkRequest } from '@/hooks/usePartnerRequests';

interface IncomingRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  request: PartnerLinkRequest | null;
  isLoading?: boolean;
}

export function IncomingRequestDialog({
  open,
  onClose,
  onAccept,
  onReject,
  request,
  isLoading = false,
}: IncomingRequestDialogProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleClose = () => {
    setConsentChecked(false);
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Partner Link Request
          </DialogTitle>
          <DialogDescription className="text-left">
            <strong>{request.sender_name}</strong> wants to link their account with yours and share your relationship journey together.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">Privacy Notice</p>
              <p className="text-muted-foreground leading-relaxed">
                Accepting this request grants <strong>{request.sender_name}</strong> access to:
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
            I understand and consent to sharing my relationship journey data with{' '}
            <strong>{request.sender_name}</strong>.
          </span>
        </label>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onReject(request.id)}
            disabled={isLoading}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Decline
          </Button>
          <Button
            onClick={() => onAccept(request.id)}
            disabled={!consentChecked || isLoading}
          >
            {isLoading ? 'Linking...' : 'Accept & Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
