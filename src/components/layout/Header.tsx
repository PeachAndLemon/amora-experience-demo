import { Sparkles, HeartPulse, FlaskConical, Mail } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import amoraGlyph from '@/assets/amora-glyph-white.png';

interface HeaderProps {
  title: string;
  showPartnerStatus?: boolean;
  showCelebration?: boolean;
  onOpenIncomingRequest?: () => void;
}

export function Header({ title, showPartnerStatus = true, showCelebration = false, onOpenIncomingRequest }: HeaderProps) {
  const { profile } = useProfile();
  const { hasPendingIncoming, hasPendingOutgoing } = usePartnerRequests();
  const { isDemoActive } = useDemoMode();
  
  const isPartnerConnected = profile?.partner_connected ?? false;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 safe-top">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-sunset flex items-center justify-center">
            <img src={amoraGlyph} alt="Amora" className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-semibold text-foreground">{title}</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          {isDemoActive && (
            <div className="flex items-center gap-1.5 bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30 animate-pulse-soft">
              <FlaskConical className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Demo</span>
            </div>
          )}
          {showCelebration && (
            <div className="flex items-center gap-1 text-gold animate-pulse-soft">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          {/* Incoming partner request notification */}
          {showPartnerStatus && hasPendingIncoming && !isPartnerConnected && (
            <button
              onClick={onOpenIncomingRequest}
              className="relative flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            </button>
          )}
          {/* Pending outgoing request */}
          {showPartnerStatus && hasPendingOutgoing && !isPartnerConnected && !hasPendingIncoming && (
            <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
              <HeartPulse className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
            </div>
          )}
          {showPartnerStatus && isPartnerConnected && (
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
              <HeartPulse className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-secondary-foreground">Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
