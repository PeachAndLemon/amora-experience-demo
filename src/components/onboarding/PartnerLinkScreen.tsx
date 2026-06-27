import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Heart, Link2, UserPlus, Key, Copy, Loader2, Check, Clock } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { PartnerConsentDialog } from '@/components/partner/PartnerConsentDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PartnerLinkScreenProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

type LinkMethod = 'invite' | 'code';

export function PartnerLinkScreen({
  onComplete,
  onSkip,
  onBack
}: PartnerLinkScreenProps) {
  const { getPartnerCode } = useProfile();
  const { sendRequest, hasPendingOutgoing } = usePartnerRequests();
  const [linkMethod, setLinkMethod] = useState<LinkMethod | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [partnerPreview, setPartnerPreview] = useState<{ name: string } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  
  const myPartnerCode = getPartnerCode();

  // Debounced partner code lookup
  useState(() => {
    // handled via useEffect below
  });

  // We need useEffect for the debounced lookup
  const handleCodeChange = (value: string) => {
    setPartnerCode(value);
  };

  // Debounced lookup effect - import useEffect
  // Using a manual approach since we already have the pattern
  const [lookupTimeout, setLookupTimeout] = useState<NodeJS.Timeout | null>(null);

  const doLookup = (code: string) => {
    if (lookupTimeout) clearTimeout(lookupTimeout);
    const trimmed = code.trim().toLowerCase();
    if (trimmed.length < 8) {
      setPartnerPreview(null);
      return;
    }
    setIsLookingUp(true);
    const timeout = setTimeout(async () => {
      const { data } = await (supabase.rpc as any)('lookup_partner_by_code', { code_input: trimmed });
      const name = Array.isArray(data) ? data[0]?.name : null;
      setPartnerPreview(name ? { name } : null);
      setIsLookingUp(false);
    }, 500);
    setLookupTimeout(timeout);
  };

  const handleCopyCode = async () => {
    if (myPartnerCode) {
      await navigator.clipboard.writeText(myPartnerCode);
      toast.success('Partner code copied!');
    }
  };

  const handleInitiateLink = () => {
    if (!partnerCode.trim() || !partnerPreview) return;
    setShowConsentDialog(true);
  };

  const handleConfirmSendRequest = async () => {
    setIsLinking(true);
    const { success, error } = await sendRequest(partnerCode);
    setIsLinking(false);
    setShowConsentDialog(false);

    if (success) {
      toast.success('Link request sent!', {
        description: `Waiting for ${partnerPreview?.name} to accept.`,
      });
    } else {
      toast.error(error || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-wine flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-wine-light/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cream" />
        </button>
        <button onClick={onSkip} className="text-cream/70 text-sm font-medium hover:text-cream transition-colors">
          Skip for now
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-blush/20 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                  <Heart className="w-5 h-5 text-wine fill-current" />
                </div>
                <Link2 className="w-5 h-5 text-gold" />
                <div className="w-10 h-10 rounded-full bg-cream/30 border-2 border-dashed border-cream/50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-cream/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-cream mb-3">
            Link Your Partner
          </h1>
          <p className="text-cream/70 leading-relaxed">
            Your Love Passport is shared. Invite your partner to join or link an existing account.
          </p>
        </div>

        {/* Show partner code if available */}
        {myPartnerCode && !linkMethod && (
          <div className="max-w-sm mx-auto mb-6">
            <p className="text-sm text-cream/60 text-center mb-2">Your partner code</p>
            <button 
              onClick={handleCopyCode}
              className="w-full flex items-center justify-center gap-2 bg-gold/20 border border-gold/30 rounded-xl px-4 py-3 hover:bg-gold/30 transition-colors"
            >
              <span className="font-mono text-lg tracking-widest text-gold font-semibold">
                {myPartnerCode.toUpperCase()}
              </span>
              <Copy className="w-4 h-4 text-gold" />
            </button>
          </div>
        )}

        {/* Pending state */}
        {hasPendingOutgoing && !linkMethod && (
          <div className="max-w-sm mx-auto mb-6">
            <div className="flex items-center gap-3 bg-gold/15 border border-gold/30 rounded-2xl px-4 py-3">
              <Clock className="w-5 h-5 text-gold" />
              <div>
                <p className="text-cream font-medium">Request Pending</p>
                <p className="text-cream/50 text-xs">Waiting for your partner to accept</p>
              </div>
            </div>
          </div>
        )}

        {/* Link method selection */}
        {!linkMethod && !hasPendingOutgoing && (
          <div className="space-y-3 max-w-sm mx-auto">
            <button onClick={() => setLinkMethod('code')} className="option-card w-full bg-cream/10 hover:bg-cream/15 border-cream/20">
              <div className="icon-circle bg-gold/20">
                <Key className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-cream">I have a partner code</span>
                <p className="text-sm text-cream/60 mt-0.5">Link an existing account</p>
              </div>
            </button>
          </div>
        )}

        {/* Code flow */}
        {linkMethod === 'code' && (
          <div className="max-w-sm mx-auto space-y-4">
            <button onClick={() => setLinkMethod(null)} className="text-sm text-cream/60 hover:text-cream flex items-center gap-1 mb-4">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            <Input
              type="text"
              placeholder="Enter partner code"
              value={partnerCode}
              onChange={e => { handleCodeChange(e.target.value); doLookup(e.target.value); }}
              className="h-14 text-lg bg-cream/10 border-cream/20 rounded-2xl px-5 text-cream placeholder:text-cream/40 uppercase tracking-widest text-center"
            />

            {/* Partner preview */}
            {isLookingUp && (
              <div className="flex items-center justify-center gap-2 text-cream/60 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Looking up partner...</span>
              </div>
            )}
            {partnerPreview && !isLookingUp && (
              <div className="flex items-center gap-3 bg-gold/15 border border-gold/30 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-cream font-medium">{partnerPreview.name}</p>
                  <p className="text-cream/50 text-xs">Ready to link</p>
                </div>
                <Check className="w-5 h-5 text-gold ml-auto" />
              </div>
            )}
            {partnerCode.trim().length >= 8 && !partnerPreview && !isLookingUp && (
              <p className="text-center text-sm text-destructive/80">No account found with this code</p>
            )}
            
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full" 
              onClick={handleInitiateLink} 
              disabled={!partnerCode.trim() || isLinking || !partnerPreview}
            >
              Send Link Request
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button variant="ghost" size="lg" className="w-full text-cream/70 hover:text-cream hover:bg-cream/10" onClick={onSkip}>
          Skip for now
        </Button>
      </div>

      <PartnerConsentDialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConfirm={handleConfirmSendRequest}
        partnerName={partnerPreview?.name || ''}
        mode="send"
        isLoading={isLinking}
      />
    </div>
  );
}
