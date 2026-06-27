import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAmora } from '@/contexts/AmoraContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useProfile } from '@/hooks/useProfile';
import { useAdminRole } from '@/hooks/useAdminRole';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { IncomingRequestDialog } from '@/components/partner/IncomingRequestDialog';
import { Button } from '@/components/ui/button';
import { ProfileEditScreen } from './ProfileEditScreen';
import { AdminScreen } from './AdminScreen';
import { PreferencesScreen } from './PreferencesScreen';
import {
  Heart,
  HeartPulse,
  Settings,
  Shield,
  Download,
  HelpCircle,
  ChevronRight,
  LogOut,
  Edit,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ProfileScreen() {
  const { passportData, signOut } = useAmora();
  const { deactivateDemo } = useDemoMode();
  const { profile, refetch } = useProfile();
  const { isAdmin } = useAdminRole();
  const { 
    incomingRequests, 
    hasPendingIncoming, 
    hasPendingOutgoing,
    acceptRequest, 
    rejectRequest 
  } = usePartnerRequests();
  const [showEditScreen, setShowEditScreen] = useState(false);
  const [showAdminScreen, setShowAdminScreen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showIncomingDialog, setShowIncomingDialog] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  const isPartnerConnected = profile?.partner_connected || false;

  const handleAcceptRequest = async (requestId: string) => {
    setIsProcessingRequest(true);
    const success = await acceptRequest(requestId);
    setIsProcessingRequest(false);
    if (success) {
      toast.success('Partner linked successfully!');
      setShowIncomingDialog(false);
      await refetch();
    } else {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsProcessingRequest(true);
    const success = await rejectRequest(requestId);
    setIsProcessingRequest(false);
    if (success) {
      toast.success('Request declined');
      setShowIncomingDialog(false);
    } else {
      toast.error('Failed to decline request');
    }
  };

  const menuItems = [
    { icon: Edit, label: 'Edit Profile', description: 'Names & partner settings', action: () => setShowEditScreen(true) },
    { icon: Settings, label: 'Preferences', description: 'Relationship goals & settings', action: () => setShowPreferences(true) },
    { icon: Shield, label: 'Privacy', description: 'Control your data' },
    { icon: Download, label: 'Export Memories', description: 'Save your journey' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: ShieldCheck, label: 'Admin Panel', description: 'Manage events, activities & rewards', action: () => setShowAdminScreen(true) });
  }

  if (showAdminScreen) {
    return <AdminScreen onBack={() => setShowAdminScreen(false)} />;
  }

  if (showEditScreen) {
    return <ProfileEditScreen onBack={() => setShowEditScreen(false)} />;
  }

  if (showPreferences) {
    return <PreferencesScreen onBack={() => setShowPreferences(false)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="Profile" 
        showPartnerStatus={false}
        onOpenIncomingRequest={() => setShowIncomingDialog(true)}
      />

      <main className="px-6 py-6 space-y-8">
        {/* Profile card */}
        <div className="bg-card rounded-2xl p-6 shadow-card text-center">
          <div className="w-24 h-24 rounded-full gradient-sunset mx-auto flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-primary-foreground fill-current" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">
            {passportData.coupleName || 'Your Journey'}
          </h1>
          <p className="text-muted-foreground mb-4">
            Together since {format(passportData.startDate, 'MMMM yyyy')}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">
                {passportData.level}
              </p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">
                {passportData.earnedStamps}
              </p>
              <p className="text-sm text-muted-foreground">Stamps</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col items-center">
              {isPartnerConnected ? (
                <>
                  <HeartPulse className="w-6 h-6 text-primary" />
                  <p className="text-sm text-muted-foreground">Connected</p>
                </>
              ) : hasPendingOutgoing ? (
                <>
                  <Clock className="w-6 h-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Pending</p>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditScreen(true)}
                  className="text-xs h-8 px-3"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Link Partner?
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                index !== 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={() => { deactivateDemo(); signOut(); }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>

      {/* Incoming partner request dialog */}
      <IncomingRequestDialog
        open={showIncomingDialog}
        onClose={() => setShowIncomingDialog(false)}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        request={incomingRequests[0] || null}
        isLoading={isProcessingRequest}
      />
    </div>
  );
}
