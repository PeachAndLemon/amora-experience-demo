import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StampComponent } from '@/components/passport/StampComponent';
import { useAmora } from '@/contexts/AmoraContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserPassport } from '@/hooks/useUserPassport';
import { Heart, Calendar, Award, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { MilestoneIcon } from '@/lib/milestoneIcons';
import { Button } from '@/components/ui/button';

export function PassportScreen() {
  const { passportData: basePassportData } = useAmora();
  const { isDemoActive, demoData } = useDemoMode();
  const { profile } = useProfile();
  const { milestones, totalEarned, totalStamps, loading } = useUserPassport();
  const [pageIndex, setPageIndex] = useState(0);

  const passportData = isDemoActive && demoData ? demoData.passportData : basePassportData;

  const displayName = isDemoActive
    ? passportData.coupleName
    : profile?.partner_connected
      ? `${profile.partner1_name} & ${profile.partner2_name}`
      : profile?.partner1_name || passportData.coupleName;

  // When demo is active, fall back to passportData.stamps (single page)
  const useDemo = isDemoActive && demoData;
  const pages = useDemo ? [] : milestones;
  const safeIndex = pages.length ? Math.min(pageIndex, pages.length - 1) : 0;
  const currentMilestone = pages[safeIndex];

  const goPrev = () => setPageIndex(i => (i - 1 + pages.length) % pages.length);
  const goNext = () => setPageIndex(i => (i + 1) % pages.length);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Love Passport" />

      <main className="px-6 py-6 space-y-8">
        {/* Passport cover */}
        <div className="relative bg-card rounded-3xl overflow-hidden shadow-elevated">
          <div className="gradient-sunset p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-primary-foreground fill-current" />
            </div>
            <p className="text-primary-foreground/80 text-sm uppercase tracking-widest mb-1">Love Passport</p>
            <h1 className="font-serif text-2xl font-bold text-primary-foreground">{displayName}</h1>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Journey Started</p>
                  <p className="font-medium text-foreground">{format(passportData.startDate, 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gold" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Stamps</p>
                  <p className="font-medium text-foreground">
                    {useDemo ? `${passportData.stamps.filter(s => s.isEarned).length}/${passportData.stamps.length}` : `${totalEarned}/${totalStamps}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamps collection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-foreground">Your Stamps</h2>
          </div>

          {useDemo ? (
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="grid grid-cols-4 gap-4">
                {passportData.stamps.map((stamp) => (
                  <div key={stamp.id} className="flex flex-col items-center gap-2">
                    <StampComponent stamp={stamp} size="md" />
                    <p className="text-xs text-center text-muted-foreground line-clamp-1">{stamp.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="bg-card rounded-2xl p-8 shadow-card text-center text-sm text-muted-foreground">Loading stamps…</div>
          ) : !currentMilestone ? (
            <div className="bg-card rounded-2xl p-8 shadow-card text-center text-sm text-muted-foreground">
              No milestones yet. An admin can add them in the admin panel.
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
              {/* Milestone sub-header with arrow nav */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost" size="icon"
                  onClick={goPrev}
                  disabled={pages.length < 2}
                  aria-label="Previous milestone"
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </Button>
                <div className="flex-1 text-center min-w-0">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MilestoneIcon iconId={currentMilestone.iconId} className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground truncate">
                      {currentMilestone.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMilestone.earnedStamps}/{currentMilestone.totalStamps} Stamps
                  </p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  onClick={goNext}
                  disabled={pages.length < 2}
                  aria-label="Next milestone"
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </Button>
              </div>

              {/* Page dots */}
              {pages.length > 1 && (
                <div className="flex justify-center gap-1.5">
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPageIndex(i)}
                      aria-label={`Go to milestone ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === safeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Stamps grid */}
              {currentMilestone.stamps.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Lock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No stamps in this milestone yet.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {currentMilestone.stamps.map((stamp) => (
                    <div key={stamp.id} className="flex flex-col items-center gap-2">
                      <StampComponent stamp={stamp} size="md" />
                      <p className="text-xs text-center text-muted-foreground line-clamp-2">{stamp.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
