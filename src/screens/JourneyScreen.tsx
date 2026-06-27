import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PassportCard } from '@/components/passport/PassportCard';
import { SuggestedMomentCard } from '@/components/journey/SuggestedMomentCard';
import { RecentMomentsCarousel } from '@/components/journey/RecentMomentsCarousel';
import { MilestonesSection } from '@/components/journey/MilestonesSection';
import { useAmora } from '@/contexts/AmoraContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { useProfile } from '@/hooks/useProfile';
import { IncomingRequestDialog } from '@/components/partner/IncomingRequestDialog';

import { useRecommendation } from '@/hooks/useRecommendation';
import { useUserPassport } from '@/hooks/useUserPassport';
import { ActivityFeedback, Activity } from '@/types/amora';
import { Clock, Compass } from 'lucide-react';
import { activities as baseActivities } from '@/data/mockData';
import { toast } from 'sonner';

interface JourneyScreenProps {
  onNavigateToPassport: () => void;
  onNavigateToMilestone: (id: string) => void;
  onStartActivity: (id: string) => void;
  onOpenEventCheckIn: () => void;
  onNavigateToProfile?: () => void;
  activityFeedback?: ActivityFeedback[];
}

export function JourneyScreen({
  onNavigateToPassport,
  onNavigateToMilestone,
  onStartActivity,
  onOpenEventCheckIn,
  onNavigateToProfile,
  activityFeedback = [],
}: JourneyScreenProps) {
  const { passportData: basePassportData, coupleGoals } = useAmora();
  const { isDemoActive, demoData } = useDemoMode();
  const { incomingRequests, acceptRequest, rejectRequest } = usePartnerRequests();
  const { refetch } = useProfile();
  const { milestones: dbMilestones } = useUserPassport();
  const [showIncomingDialog, setShowIncomingDialog] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  
  const recommendation = useRecommendation(coupleGoals, activityFeedback);

  const passportData = isDemoActive && demoData ? demoData.passportData : basePassportData;
  const activities = isDemoActive && demoData ? demoData.activities : baseActivities;
  const journeyMilestones = isDemoActive && demoData ? passportData.milestones : (dbMilestones.length ? dbMilestones : passportData.milestones);

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

  const handleRecommendationStart = () => {
    if (!recommendation) return;
    
    if (recommendation.type === 'event') {
      onOpenEventCheckIn();
    } else {
      onStartActivity((recommendation.item as Activity).id);
    }
  };

  const hasRecentMoments = activities.some(a => a.isCompleted);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="Your Journey" 
        onOpenIncomingRequest={() => setShowIncomingDialog(true)}
      />

      <main className="px-6 py-6 space-y-8">
        {/* 1. Love Passport Progress */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
            Your Love Passport
          </h2>
          <PassportCard data={passportData} onClick={onNavigateToPassport} onLinkPartner={onNavigateToProfile} />
        </section>

        {/* 2. Your Next Journey Moment */}
        {recommendation && (
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
              Your Next Journey Moment
            </h2>
            <SuggestedMomentCard
              type={recommendation.type}
              item={recommendation.item}
              reason={recommendation.reason}
              onStart={handleRecommendationStart}
            />
          </section>
        )}

        {/* 3. Recent Moments */}
        {hasRecentMoments && (
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recent Moments
            </h2>
            <RecentMomentsCarousel 
              activities={activities} 
              passportData={passportData} 
            />
          </section>
        )}

        {/* 4. Milestones Section */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-muted-foreground" />
            Milestones
          </h2>
          <MilestonesSection
            milestones={journeyMilestones}
            onMilestoneClick={onNavigateToMilestone}
          />
        </section>
      </main>

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
