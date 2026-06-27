import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { RewardCard } from '@/components/rewards/RewardCard';
import { useAdminContent } from '@/hooks/useAdminContent';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Gift, Ticket, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function RewardsScreen() {
  const { rewards: baseRewards } = useAdminContent();
  const { isDemoActive, demoData, activateDemo, deactivateDemo } = useDemoMode();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const rewards = isDemoActive && demoData ? demoData.rewards : baseRewards;
  const unlockedRewards = rewards.filter((r) => r.isUnlocked);
  const lockedRewards = rewards.filter((r) => !r.isUnlocked);

  const handleRedeemPromo = async () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setRedeeming(true);
    const { data, error } = await supabase.rpc('redeem_promo_code' as any, { code_input: code });
    setRedeeming(false);
    if (error) { setPromoError(error.message); return; }
    const result = data as { success: boolean; error?: string; type?: string; name?: string };
    if (!result?.success) { setPromoError(result?.error ?? 'Invalid code'); return; }
    setPromoCode('');
    if (result.type === 'demo') {
      activateDemo();
      toast.success('Demo mode activated!', { description: 'Showing a lived-in couple experience.', icon: <Sparkles className="w-4 h-4" /> });
    } else {
      toast.success(`Redeemed: ${result.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Rewards" />

      <main className="px-6 py-6 space-y-8">
        {isDemoActive && (
          <div className="bg-accent/20 border border-accent rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">Demo Mode Active</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { deactivateDemo(); toast('Demo mode deactivated'); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl gradient-stamp flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">{unlockedRewards.length}</p>
              <p className="text-muted-foreground">Rewards Earned</p>
            </div>
          </div>
        </div>

        {!isDemoActive && (
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-medium text-foreground text-sm">Have a promo code?</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                className="flex-1 uppercase"
              />
              <Button onClick={handleRedeemPromo} disabled={!promoCode.trim() || redeeming}>
                {redeeming ? '…' : 'Redeem'}
              </Button>
            </div>
            {promoError && <p className="text-sm text-destructive">{promoError}</p>}
          </div>
        )}

        {unlockedRewards.length > 0 && (
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Your Rewards</h2>
            <div className="space-y-4">
              {unlockedRewards.map((reward) => <RewardCard key={reward.id} reward={reward} />)}
            </div>
          </section>
        )}

        {lockedRewards.length > 0 && (
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Coming Soon</h2>
            <div className="space-y-4">
              {lockedRewards.map((reward) => <RewardCard key={reward.id} reward={reward} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
