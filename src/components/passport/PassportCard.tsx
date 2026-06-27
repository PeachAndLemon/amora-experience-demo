import { PassportData } from '@/types/amora';
import { StampComponent } from './StampComponent';
import { Heart, Plane, Clock } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { Button } from '@/components/ui/button';
import amoraGlyph from '@/assets/amora-glyph-white.png';

interface PassportCardProps {
  data: PassportData;
  onClick?: () => void;
  onLinkPartner?: () => void;
}

export function PassportCard({ data, onClick, onLinkPartner }: PassportCardProps) {
  const { profile } = useProfile();
  const { hasPendingOutgoing } = usePartnerRequests();
  const earnedStamps = data.stamps.filter((s) => s.isEarned);
  const displayStamps = earnedStamps.slice(0, 4);
  
  const isLinked = profile?.partner_connected;
  const name1 = profile?.partner1_name || data.coupleName;

  return (
    <button
      onClick={onClick}
      className="w-full max-w-sm mx-auto block group"
    >
      <div className="relative bg-card rounded-3xl shadow-elevated p-6 passport-texture overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-glow border border-border/50">
        {/* Passport header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-sunset flex items-center justify-center">
              <img src={amoraGlyph} alt="Amora" className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Love Passport
              </p>
              <p className="font-serif font-semibold text-foreground">
                {name1}
                <span className={isLinked ? 'text-foreground' : 'text-muted-foreground/40 italic'}>
                  {' & '}{isLinked ? profile?.partner2_name : 'Partner'}
                </span>
              </p>
              {!isLinked && !hasPendingOutgoing && onLinkPartner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onLinkPartner(); }}
                  className="text-xs h-6 px-2 gap-1 text-primary mt-0.5"
                >
                  <Heart className="w-3 h-3" />
                  Link Partner
                </Button>
              )}
              {!isLinked && hasPendingOutgoing && (
                <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs italic">Request pending</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Level {data.level}
            </span>
          </div>
        </div>

        {/* Stamps grid */}
        <div className="flex justify-center gap-3 mb-6">
          {displayStamps.map((stamp) => (
            <StampComponent key={stamp.id} stamp={stamp} size="md" />
          ))}
          {displayStamps.length < 4 &&
            Array.from({ length: 4 - displayStamps.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-16 h-16 rounded-full bg-muted/30 border-2 border-dashed border-muted-foreground/20"
              />
            ))}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Journey Progress</span>
            <span className="font-semibold text-foreground">
              {data.earnedStamps}/{data.totalStamps} stamps
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-sunset rounded-full transition-all duration-500"
              style={{ width: `${(data.earnedStamps / data.totalStamps) * 100}%` }}
            />
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 gradient-stamp opacity-10 rounded-full" />
        </div>

        {/* View prompt */}
        <p className="text-center text-xs text-muted-foreground mt-4 group-hover:text-primary transition-colors flex items-center justify-center gap-1">
          Tap to view full passport <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </p>
      </div>
    </button>
  );
}
