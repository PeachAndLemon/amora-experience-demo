import { useState, useEffect } from 'react';
import { AmoraProvider, useAmora } from '@/contexts/AmoraContext';
import { DemoModeProvider, useDemoMode } from '@/contexts/DemoModeContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { BottomNav, TabId } from '@/components/layout/BottomNav';
import { JourneyScreen } from '@/screens/JourneyScreen';
import { ActivitiesScreen } from '@/screens/ActivitiesScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { PassportScreen } from '@/screens/PassportScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ActivityFlowScreen } from '@/screens/ActivityFlowScreen';
import { EventCheckInScreen } from '@/screens/EventCheckInScreen';
import { UserProfile, DeepOnboardingAnswers, PreferenceSignal, ActivityFeedback } from '@/types/amora';
import { activities } from '@/data/mockData';
import { synthesizeCoupleGoals } from '@/lib/goalSynthesis';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { SplashScreen } from '@/components/SplashScreen';

function AppContent() {
  const { isOnboarded, setIsOnboarded, setUserProfile, setDeepOnboardingAnswers, setCoupleGoals, isLoading } = useAmora();
  const [showSplash, setShowSplash] = useState(true);
  // HARDCODED: Journey is always the first screen after login/onboarding
  const [activeTab, setActiveTab] = useState<TabId>('journey');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [showEventCheckIn, setShowEventCheckIn] = useState(false);
  const [activityFeedback, setActivityFeedback] = useState<ActivityFeedback[]>([]);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Deep links from notifications
  useEffect(() => {
    const openEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFocusedEventId(detail?.eventId ?? null);
      setActiveTab('activities');
      setShowEventCheckIn(true);
    };
    window.addEventListener('amora:open-event', openEvent);
    return () => window.removeEventListener('amora:open-event', openEvent);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile, answers: DeepOnboardingAnswers) => {
    setUserProfile(profile);
    setDeepOnboardingAnswers(answers);
    const goals = synthesizeCoupleGoals(answers);
    setCoupleGoals(goals);
    setIsOnboarded(true);
    toast.success('Welcome to The Amora Experience!', {
      description: 'Your personalized journey awaits.',
    });
  };

  const handleStartActivity = (activityId: string) => {
    setActiveActivityId(activityId);
  };

  const handleActivityComplete = (rating?: number, signals?: PreferenceSignal[]) => {
    if (activeActivityId && rating) {
      const feedback: ActivityFeedback = {
        activityId: activeActivityId,
        starRating: rating,
        preferenceSignals: signals || [],
        completedAt: new Date(),
      };
      setActivityFeedback(prev => [...prev, feedback]);
    }
    
    toast.success('Activity completed!', {
      description: 'You earned a new stamp!',
    });
    setActiveActivityId(null);
  };

  const handleCloseActivity = () => {
    setActiveActivityId(null);
  };

  const handleNavigateToPassport = () => {
    setActiveTab('passport');
  };

  const handleNavigateToMilestone = (_milestoneId: string) => {
    setActiveTab('activities');
  };

  const handleOpenEventCheckIn = () => {
    setShowEventCheckIn(true);
  };

  const handleCloseEventCheckIn = () => {
    setShowEventCheckIn(false);
  };

  const handleSelectEvent = (_eventId: string) => {
    setShowEventCheckIn(true);
  };

  const handleViewPassportFromEvent = () => {
    setShowEventCheckIn(false);
    setActiveTab('passport');
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading while checking auth state
  if (isLoading) {
    return <SplashScreen />;
  }

  // Show event check-in screen
  if (showEventCheckIn) {
    return (
      <EventCheckInScreen
        onClose={() => { setFocusedEventId(null); handleCloseEventCheckIn(); }}
        onViewPassport={handleViewPassportFromEvent}
        focusedEventId={focusedEventId}
      />
    );
  }

  // Show activity flow if one is active
  if (activeActivityId) {
    const activity = activities.find((a) => a.id === activeActivityId);
    if (activity) {
      return (
        <ActivityFlowScreen
          activity={activity}
          onComplete={handleActivityComplete}
          onClose={handleCloseActivity}
        />
      );
    }
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Main app - HARDCODED: Journey tab is default
  return (
    <div className="min-h-screen bg-background">
      {activeTab === 'journey' && (
        <JourneyScreen
          onNavigateToPassport={handleNavigateToPassport}
          onNavigateToMilestone={handleNavigateToMilestone}
          onStartActivity={handleStartActivity}
          onOpenEventCheckIn={handleOpenEventCheckIn}
          onNavigateToProfile={() => setActiveTab('profile')}
          activityFeedback={activityFeedback}
        />
      )}
      {activeTab === 'activities' && (
        <ActivitiesScreen 
          onStartActivity={handleStartActivity}
          onSelectEvent={handleSelectEvent}
          feedback={activityFeedback}
        />
      )}
      {activeTab === 'rewards' && <RewardsScreen />}
      {activeTab === 'passport' && <PassportScreen />}
      {activeTab === 'profile' && <ProfileScreen />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const Index = () => {
  return (
    <AmoraProvider>
      <DemoModeProvider>
        <AppContent />
        <Toaster position="top-center" />
      </DemoModeProvider>
    </AmoraProvider>
  );
};

export default Index;