import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAmora } from '@/contexts/AmoraContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useProfile } from '@/hooks/useProfile';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { PartnerConsentDialog } from '@/components/partner/PartnerConsentDialog';
import { ExitSurveyModal } from '@/components/profile/ExitSurveyModal';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  UserX, 
  Trash2, 
  Save,
  Users,
  Link,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const { userProfile, signOut } = useAmora();
  const { deactivateDemo } = useDemoMode();
  const { profile, updateProfile, refetch } = useProfile();
  const { sendRequest, unlinkPartner, hasPendingOutgoing, outgoingRequests } = usePartnerRequests();
  
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [partnerRegisteredName, setPartnerRegisteredName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [partnerPreviewName, setPartnerPreviewName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  const myPartnerCode = profile?.partner_code || '';
  const isPartnerConnected = profile?.partner_connected || false;

  useEffect(() => {
    if (userProfile) {
      setPartner1Name(userProfile.partner1Name || '');
      setPartner2Name(userProfile.partner2Name || '');
    }
  }, [userProfile]);

  // Fetch partner's registered name when connected
  useEffect(() => {
    const fetchPartnerName = async () => {
      if (!isPartnerConnected || !profile?.partner_id) return;
      
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('partner1_name')
        .eq('id', profile.partner_id)
        .single();
      
      if (partnerProfile) {
        setPartnerRegisteredName(partnerProfile.partner1_name || '');
        setPartner2Name(partnerProfile.partner1_name || '');
      }
    };
    
    fetchPartnerName();
  }, [isPartnerConnected, profile?.partner_id]);

  // Debounced partner code preview lookup
  useEffect(() => {
    const code = partnerCodeInput.trim().toLowerCase();
    if (code.length < 8) {
      setPartnerPreviewName('');
      return;
    }

    setIsLookingUp(true);
    const timeout = setTimeout(async () => {
      const { data } = await (supabase.rpc as any)('lookup_partner_by_code', { code_input: code });
      const name = Array.isArray(data) ? data[0]?.name : null;
      setPartnerPreviewName(name || '');
      setIsLookingUp(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [partnerCodeInput]);

  const handleCopyCode = async () => {
    if (myPartnerCode) {
      await navigator.clipboard.writeText(myPartnerCode.toUpperCase());
      setIsCopied(true);
      toast.success('Partner code copied!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleInitiateLink = () => {
    if (!partnerCodeInput.trim() || !partnerPreviewName) {
      toast.error('Please enter a valid partner code');
      return;
    }
    setShowConsentDialog(true);
  };

  const handleConfirmSendRequest = async () => {
    setIsLinking(true);
    const { success, error } = await sendRequest(partnerCodeInput);
    setIsLinking(false);
    setShowConsentDialog(false);

    if (success) {
      toast.success('Link request sent!', {
        description: `Waiting for ${partnerPreviewName} to accept.`,
      });
      setPartnerCodeInput('');
      setPartnerPreviewName('');
    } else {
      toast.error(error || 'Failed to send request');
    }
  };

  const handleSaveNames = async () => {
    if (!partner1Name.trim()) {
      toast.error('Your name is required');
      return;
    }

    setIsSaving(true);
    try {
      const coupleName = partner2Name.trim() 
        ? `${partner1Name.trim()} & ${partner2Name.trim()}`
        : partner1Name.trim();

      const { error } = await updateProfile({
        partner1Name: partner1Name.trim(),
        partner2Name: partner2Name.trim(),
        coupleName,
      });

      if (error) {
        toast.error('Failed to save changes');
      } else {
        toast.success('Names updated!');
        await refetch();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectPartner = async () => {
    if (!confirm('Are you sure you want to disconnect from your partner? This will unlink your accounts and remove shared data access.')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const success = await unlinkPartner();
      if (success) {
        toast.success('Partner disconnected');
        await refetch();
      } else {
        toast.error('Failed to disconnect partner');
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleDeleteAccount = async (reason: string, feedback: string) => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      

      await supabase.from('activity_completions').delete().eq('user_id', user.id);
      await supabase.from('earned_stamps').delete().eq('user_id', user.id);
      await supabase.from('event_checkins').delete().eq('user_id', user.id);
      await supabase.from('onboarding_answers').delete().eq('user_id', user.id);
      
      // Unlink partner before deleting
      await unlinkPartner();

      await supabase.from('profiles').delete().eq('user_id', user.id);

      deactivateDemo();
      await signOut();
      toast.success('Account deleted. We hope to see you again!');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowExitSurvey(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Edit Profile" showPartnerStatus={false} />
      
      <main className="px-6 py-6 space-y-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Profile</span>
        </button>

        {/* Partner Code Section - only show when not connected */}
        {!isPartnerConnected && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-2">
              Your Partner Code
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Share this code with your partner to link your accounts
            </p>
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-4 hover:bg-primary/20 transition-colors"
            >
              <span className="font-mono text-2xl tracking-[0.3em] text-primary font-bold">
                {myPartnerCode.toUpperCase()}
              </span>
              {isCopied ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <Copy className="w-5 h-5 text-primary" />
              )}
            </button>

            {/* Pending outgoing request status */}
            {hasPendingOutgoing && (
              <div className="mt-4 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 border border-border">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Request Pending</p>
                  <p className="text-xs text-muted-foreground">
                    Waiting for {outgoingRequests[0]?.receiver_name || 'your partner'} to accept
                  </p>
                </div>
              </div>
            )}

            {!hasPendingOutgoing && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Or enter your partner's code:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={partnerCodeInput}
                    onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="h-12 font-mono tracking-widest text-center uppercase"
                    maxLength={8}
                  />
                  <Button
                    onClick={handleInitiateLink}
                    disabled={isLinking || !partnerCodeInput.trim() || !partnerPreviewName}
                    className="h-12 px-4"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
                {/* Partner preview */}
                {isLookingUp && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Looking up...</span>
                  </div>
                )}
                {partnerPreviewName && !isLookingUp && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Check className="w-3 h-3 text-primary" />
                    <span className="text-foreground">Link with <strong>{partnerPreviewName}</strong>?</span>
                  </div>
                )}
                {partnerCodeInput.trim().length >= 8 && !partnerPreviewName && !isLookingUp && (
                  <p className="text-xs text-destructive mt-2">No account found with this code</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Names Section */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Partner Names
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                placeholder="Your name"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Partner's Name</label>
              <div className="flex gap-2">
                <Input
                  value={isPartnerConnected ? partnerRegisteredName : partner2Name}
                  onChange={(e) => !isPartnerConnected && setPartner2Name(e.target.value)}
                  placeholder="Partner's name"
                  className="h-12 flex-1"
                  disabled={isPartnerConnected}
                />
                {isPartnerConnected && (
                  <Button
                    variant="outline"
                    onClick={handleDisconnectPartner}
                    disabled={isDisconnecting}
                    className="h-12 px-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                    title="Unlink partner"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {isPartnerConnected && (
                <p className="text-xs text-muted-foreground">
                  Connected to your partner's account
                </p>
              )}
            </div>

            <Button
              onClick={handleSaveNames}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-destructive/20">
          <h2 className="font-serif text-lg font-semibold text-destructive mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowExitSurvey(true)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </main>

      <PartnerConsentDialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConfirm={handleConfirmSendRequest}
        partnerName={partnerPreviewName}
        mode="send"
        isLoading={isLinking}
      />

      <ExitSurveyModal
        open={showExitSurvey}
        onClose={() => setShowExitSurvey(false)}
        onConfirmDelete={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </div>
  );
}
