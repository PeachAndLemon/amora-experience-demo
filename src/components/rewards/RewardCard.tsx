import { useState, useEffect } from 'react';
import { Reward } from '@/types/amora';
import { Lock, Gift, Star, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardCardProps {
  reward: Reward & { duration_minutes?: number | null };
  onClick?: () => void;
}

const typeIcons = { perk: Ticket, experience: Gift, partner_reward: Star } as const;

export function RewardCard({ reward }: RewardCardProps) {
  const TypeIcon = typeIcons[reward.type];
  const [open, setOpen] = useState(false);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [usedAt, setUsedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [opening, setOpening] = useState(false);

  // Look up an existing in-progress redemption when opening
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('reward_id', reward.id)
        .order('opened_at', { ascending: false })
        .limit(1);
      const r = data?.[0];
      if (r) {
        setRedemptionId(r.id);
        setExpiresAt(r.expires_at ? new Date(r.expires_at) : null);
        setUsedAt(r.used_at ? new Date(r.used_at) : null);
      } else {
        setRedemptionId(null); setExpiresAt(null); setUsedAt(null);
      }
    })();
  }, [open, reward.id]);

  useEffect(() => {
    if (!expiresAt || usedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt, usedAt]);

  const startUse = async () => {
    setOpening(true);
    const { data, error } = await supabase.rpc('open_reward' as any, {
      reward_id_input: reward.id,
      reward_name_input: reward.name,
      duration_minutes_input: reward.duration_minutes ?? null,
    });
    setOpening(false);
    if (error) { toast.error(error.message); return; }
    setRedemptionId(data as unknown as string);
    if (reward.duration_minutes) setExpiresAt(new Date(Date.now() + reward.duration_minutes * 60_000));
    toast.success('Reward opened — show this to staff');
  };

  const markUsed = async () => {
    if (!redemptionId) return;
    const { error } = await supabase.rpc('mark_reward_used' as any, { redemption_id: redemptionId });
    if (error) { toast.error(error.message); return; }
    setUsedAt(new Date());
    toast.success('Marked as used');
  };

  const remainingMs = expiresAt ? expiresAt.getTime() - now : 0;
  const remaining = Math.max(0, Math.floor(remainingMs / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  if (!reward.isUnlocked) {
    return (
      <div className="bg-muted/30 rounded-2xl p-5 border-2 border-dashed border-muted-foreground/20 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center"><Lock className="w-6 h-6 text-muted-foreground" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground">{reward.name}</h3>
            <p className="text-sm text-muted-foreground/70">Keep exploring to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 text-left group border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl gradient-stamp flex items-center justify-center shadow-stamp group-hover:scale-110 transition-transform duration-300">
            <MilestoneIcon iconId={reward.iconId} className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <TypeIcon className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-gold font-medium capitalize">{reward.type}</span>
            </div>
            <h3 className="font-semibold text-foreground">{reward.name}</h3>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
            {reward.partnerName && <p className="text-xs text-primary mt-1">from {reward.partnerName}</p>}
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{reward.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl gradient-stamp flex items-center justify-center shadow-stamp">
                <MilestoneIcon iconId={reward.iconId} className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                {reward.partnerName && <p className="text-xs text-primary mt-1">from {reward.partnerName}</p>}
              </div>
            </div>

            {usedAt ? (
              <div className="rounded-xl bg-secondary/50 p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Used on {usedAt.toLocaleString()}</p>
              </div>
            ) : redemptionId ? (
              <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 text-center space-y-3">
                {expiresAt && (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-2xl font-mono font-bold text-gold">{mm}:{ss}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Show this screen to staff to redeem</p>
                <Button onClick={markUsed} className="w-full rounded-xl" disabled={remainingMs < 0 && !!expiresAt}>
                  Mark as Used
                </Button>
              </div>
            ) : (
              <Button onClick={startUse} disabled={opening} className="w-full rounded-xl" size="lg">
                {reward.duration_minutes ? `Open & start ${reward.duration_minutes}-min window` : 'Open Reward'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
