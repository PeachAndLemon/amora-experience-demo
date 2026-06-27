import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Mail, Link2, QrCode, Heart, Check } from 'lucide-react';

interface PartnerInviteProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

type InviteMethod = 'email' | 'link' | 'qr';

export function PartnerInvite({ onComplete, onSkip, onBack }: PartnerInviteProps) {
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email');
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSendEmail = () => {
    if (email.trim()) {
      setIsSent(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://amora.app/invite/abc123');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="min-h-screen gradient-blush flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={onSkip}
          className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-12 h-12 rounded-full gradient-sunset flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-foreground fill-current" />
                </div>
                <div className="text-3xl">💞</div>
                <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-xl">?</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Invite your partner
          </h1>
          <p className="text-muted-foreground">
            Your journey is better together
          </p>
        </div>

        {/* Invite method tabs */}
        <div className="flex gap-2 mb-6 max-w-sm mx-auto">
          {[
            { id: 'email' as const, icon: Mail, label: 'Email' },
            { id: 'link' as const, icon: Link2, label: 'Link' },
            { id: 'qr' as const, icon: QrCode, label: 'QR Code' },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setInviteMethod(method.id)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                inviteMethod === method.id
                  ? 'bg-card shadow-card border border-primary/20'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <method.icon
                className={`w-5 h-5 ${
                  inviteMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  inviteMethod === method.id ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {method.label}
              </span>
            </button>
          ))}
        </div>

        {/* Invite content */}
        <div className="max-w-sm mx-auto">
          {inviteMethod === 'email' && (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="partner@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg bg-card border-border rounded-2xl px-5"
                disabled={isSent}
              />
              {isSent ? (
                <div className="flex items-center justify-center gap-2 text-primary p-4 bg-secondary rounded-2xl">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Invitation sent!</span>
                </div>
              ) : (
                <Button
                  variant="sunset"
                  size="lg"
                  className="w-full"
                  onClick={handleSendEmail}
                  disabled={!email.trim()}
                >
                  Send Invitation
                </Button>
              )}
            </div>
          )}

          {inviteMethod === 'link' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value="https://amora.app/invite/abc123"
                  readOnly
                  className="h-14 bg-card border-border rounded-2xl px-5 text-muted-foreground"
                />
                <Button
                  variant={isCopied ? 'default' : 'outline'}
                  size="icon"
                  className="h-14 w-14 shrink-0"
                  onClick={handleCopyLink}
                >
                  {isCopied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                </Button>
              </div>
              {isCopied && (
                <p className="text-center text-primary text-sm font-medium">
                  Link copied to clipboard!
                </p>
              )}
            </div>
          )}

          {inviteMethod === 'qr' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-card rounded-2xl shadow-card flex items-center justify-center border border-border">
                <div className="w-40 h-40 bg-foreground/5 rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Have your partner scan this code to join your journey
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 safe-bottom">
        <Button
          variant="blush"
          size="lg"
          className="w-full"
          onClick={onComplete}
        >
          Continue Solo for Now
        </Button>
      </div>
    </div>
  );
}
