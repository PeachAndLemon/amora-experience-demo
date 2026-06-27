import { useState, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { LoginScreen } from './LoginScreen';
import { PartnersScreen } from './PartnersScreen';
import { PartnerLinkScreen } from './PartnerLinkScreen';
import { SeasonScreen } from './SeasonScreen';
import { DurationScreen } from './DurationScreen';
import { AutopilotScreen } from './AutopilotScreen';
import { RichInScreen } from './RichInScreen';
import { WantMoreScreen } from './WantMoreScreen';
import { GetsInWayScreen } from './GetsInWayScreen';
import { LoveAsPlaceScreen } from './LoveAsPlaceScreen';
import { DestinationScreen } from './DestinationScreen';
import { WishScreen } from './WishScreen';
import { SignupScreen } from './SignupScreen';
import { OnboardingCompleteScreen } from './OnboardingCompleteScreen';
import { OnboardingStep, UserProfile, DeepOnboardingAnswers, RichIn } from '@/types/amora';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/SplashScreen';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile, answers: DeepOnboardingAnswers) => void;
}

const defaultAnswers: DeepOnboardingAnswers = {
  partner1Name: '',
  partner2Name: '',
  relationshipSeason: null,
  relationshipDuration: null,
  autopilotLevel: 5,
  richIn: null,
  richInOther: '',
  wantMoreOf: [],
  getsInWay: [],
  loveAsPlace: '',
  destinationFeeling: null,
  amoraWish: '',
  growthDirections: [],
  currentDynamic: null,
  experienceStyle: null,
  behavioralIntents: [],
  amoraIntention: null,
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [answers, setAnswers] = useState<DeepOnboardingAnswers>(defaultAnswers);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  // When user becomes authenticated (after login), check if they have a profile
  // If they do, trigger onComplete to navigate to the app
  useEffect(() => {
    if (user && step === 'login') {
      checkExistingProfile();
    }
  }, [user, step]);

  const checkExistingProfile = async () => {
    if (!user) return;
    
    setIsCheckingProfile(true);
    try {
      // Fetch profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, partner1_name, partner2_name, couple_name, relationship_season, relationship_duration, start_date, partner_id, partner_connected, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      // Fetch onboarding answers
      const { data: dbAnswers } = await supabase
        .from('onboarding_answers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.partner1_name) {
        // User has completed onboarding - go to app
        const loadedProfile: UserProfile = {
          partner1Name: profile.partner1_name,
          partner2Name: profile.partner2_name,
          coupleName: profile.couple_name,
          relationshipSeason: profile.relationship_season as UserProfile['relationshipSeason'] || 'building',
          relationshipDuration: profile.relationship_duration as UserProfile['relationshipDuration'] || '0-2',
          startDate: new Date(profile.start_date || profile.created_at),
          preferences: [],
          partnerConnected: profile.partner_connected || false,
        };

        const loadedAnswers: DeepOnboardingAnswers = dbAnswers ? {
          partner1Name: profile.partner1_name,
          partner2Name: profile.partner2_name,
          relationshipSeason: profile.relationship_season as any,
          relationshipDuration: profile.relationship_duration as any,
          autopilotLevel: dbAnswers.autopilot_level || 5,
          richIn: dbAnswers.rich_in as any,
          richInOther: dbAnswers.rich_in_other || '',
          wantMoreOf: (dbAnswers.want_more_of || []) as any,
          getsInWay: (dbAnswers.gets_in_way || []) as any,
          loveAsPlace: dbAnswers.love_as_place || '',
          destinationFeeling: dbAnswers.destination_feeling as any,
          amoraWish: dbAnswers.amora_wish || '',
          growthDirections: [],
          currentDynamic: null,
          experienceStyle: null,
          behavioralIntents: [],
          amoraIntention: null,
        } : defaultAnswers;

        toast.success('Welcome back!');
        onComplete(loadedProfile, loadedAnswers);
      } else {
        // User exists but hasn't completed profile (missing names)
        // If they have onboarding_answers, load those and just ask for names
        if (dbAnswers) {
          setAnswers(prev => ({
            ...prev,
            relationshipSeason: profile?.relationship_season as any || null,
            relationshipDuration: profile?.relationship_duration as any || null,
            autopilotLevel: dbAnswers.autopilot_level || 5,
            richIn: dbAnswers.rich_in as any,
            richInOther: dbAnswers.rich_in_other || '',
            wantMoreOf: (dbAnswers.want_more_of || []) as any,
            getsInWay: (dbAnswers.gets_in_way || []) as any,
            loveAsPlace: dbAnswers.love_as_place || '',
            destinationFeeling: dbAnswers.destination_feeling as any,
            amoraWish: dbAnswers.amora_wish || '',
          }));
          toast.info('Just need your names to complete setup');
        } else {
          toast.info('Please complete your profile setup');
        }
        setStep('partners');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Something went wrong');
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleWelcomeStart = () => setStep('partners');
  const handleWelcomeExisting = () => setStep('login');

  const handleLogin = async (email: string, password: string) => {
    // Login was successful - useEffect above will handle profile check
    // when user state updates
  };

  const handlePartners = async (partner1: string, partner2: string) => {
    setAnswers(prev => ({ ...prev, partner1Name: partner1, partner2Name: partner2 }));
    
    // If user is already authenticated (returning user with incomplete profile),
    // save profile directly and go to complete screen
    if (user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            partner1_name: partner1,
            partner2_name: partner2,
            couple_name: `${partner1} & ${partner2}`,
            relationship_season: answers.relationshipSeason,
            relationship_duration: answers.relationshipDuration,
            start_date: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Error saving profile:', profileError);
          toast.error('Failed to save profile');
          return;
        }

        toast.success('Profile complete!');
        setStep('invite');
      } catch (error) {
        console.error('Error saving profile:', error);
        toast.error('Something went wrong');
      }
    } else {
      // New user - continue to onboarding questions (partner link comes after signup)
      setStep('season');
    }
  };

  const handlePartnerLink = () => {
    setStep('complete');
  };

  const handlePartnerLinkSkip = () => {
    setStep('complete');
  };

  const handleSeason = (season: typeof answers.relationshipSeason) => {
    setAnswers(prev => ({ ...prev, relationshipSeason: season }));
    setStep('duration');
  };

  const handleDuration = (duration: typeof answers.relationshipDuration) => {
    setAnswers(prev => ({ ...prev, relationshipDuration: duration }));
    setStep('autopilot');
  };

  const handleAutopilot = (level: number) => {
    setAnswers(prev => ({ ...prev, autopilotLevel: level }));
    setStep('rich-in');
  };

  const handleRichIn = (richIn: RichIn, otherText?: string) => {
    setAnswers(prev => ({ ...prev, richIn, richInOther: otherText || '' }));
    setStep('want-more');
  };

  const handleWantMore = (wantMoreOf: typeof answers.wantMoreOf) => {
    setAnswers(prev => ({ ...prev, wantMoreOf }));
    setStep('gets-in-way');
  };

  const handleGetsInWay = (getsInWay: typeof answers.getsInWay) => {
    setAnswers(prev => ({ ...prev, getsInWay }));
    setStep('love-as-place');
  };

  const handleLoveAsPlace = (text: string) => {
    setAnswers(prev => ({ ...prev, loveAsPlace: text }));
    setStep('destination');
  };

  const handleDestination = (destination: typeof answers.destinationFeeling) => {
    setAnswers(prev => ({ ...prev, destinationFeeling: destination }));
    setStep('wish');
  };

  const handleWish = (wish: string) => {
    setAnswers(prev => ({ ...prev, amoraWish: wish }));
    setStep('signup');
  };

  const handleSignupComplete = async () => {
    // Save profile and onboarding data to database
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      toast.error('Please complete signup first');
      return;
    }

    try {
      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          partner1_name: answers.partner1Name,
          partner2_name: answers.partner2Name,
          couple_name: `${answers.partner1Name} & ${answers.partner2Name}`,
          relationship_season: answers.relationshipSeason,
          relationship_duration: answers.relationshipDuration,
          start_date: new Date().toISOString(),
        })
        .eq('user_id', currentUser.id);

      if (profileError) {
        console.error('Error saving profile:', profileError);
        toast.error('Failed to save profile');
        return;
      }

      // Save onboarding answers
      const { error: answersError } = await supabase
        .from('onboarding_answers')
        .upsert({
          user_id: currentUser.id,
          autopilot_level: answers.autopilotLevel,
          rich_in: answers.richIn,
          rich_in_other: answers.richInOther || null,
          want_more_of: answers.wantMoreOf,
          gets_in_way: answers.getsInWay,
          love_as_place: answers.loveAsPlace,
          destination_feeling: answers.destinationFeeling,
          amora_wish: answers.amoraWish,
        });

      if (answersError) {
        console.error('Error saving onboarding answers:', answersError);
        toast.error('Failed to save answers');
        return;
      }

      // Save survey history snapshot
      const { data: historyCount } = await supabase
        .from('onboarding_survey_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('user_id', currentUser.id)
        .single();

      await supabase.from('onboarding_survey_history').insert({
        user_id: currentUser.id,
        partner_id: profileData?.partner_id ?? null,
        survey_number: (historyCount as any)?.length ? (historyCount as any).length + 1 : 1,
        relationship_season: answers.relationshipSeason,
        relationship_duration: answers.relationshipDuration,
        autopilot_level: answers.autopilotLevel,
        rich_in: answers.richIn,
        rich_in_other: answers.richInOther || null,
        want_more_of: answers.wantMoreOf,
        gets_in_way: answers.getsInWay as string[],
        love_as_place: answers.loveAsPlace,
        destination_feeling: answers.destinationFeeling,
        amora_wish: answers.amoraWish,
      } as any);

      // Set next survey due at 3 months
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 3);
      await supabase.from('profiles').update({ next_survey_due: nextDue.toISOString() } as any).eq('user_id', currentUser.id);

      // Move to partner link step (user is now authenticated)
      setStep('invite');
    } catch (error) {
      console.error('Error during signup completion:', error);
      toast.error('Something went wrong');
    }
  };

  const handleFinalComplete = async () => {
    const coupleName = `${answers.partner1Name} & ${answers.partner2Name}`;
    
    // Check if partner was linked during onboarding
    let partnerConnected = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_connected')
        .eq('user_id', user.id)
        .single();
      partnerConnected = profile?.partner_connected || false;
    }
    
    const finalProfile: UserProfile = {
      partner1Name: answers.partner1Name,
      partner2Name: answers.partner2Name,
      coupleName,
      relationshipSeason: answers.relationshipSeason || 'building',
      relationshipDuration: answers.relationshipDuration || '0-2',
      startDate: new Date(),
      preferences: [],
      partnerConnected,
    };
    onComplete(finalProfile, answers);
  };

  // Show loading state while checking profile after login
  if (isCheckingProfile) {
    return <SplashScreen />;
  }

  switch (step) {
    case 'welcome':
      return <WelcomeScreen onStart={handleWelcomeStart} onExisting={handleWelcomeExisting} />;
    case 'login':
      return <LoginScreen onLogin={handleLogin} onBack={() => setStep('welcome')} isLoading={authLoading} />;
    case 'partners':
      return <PartnersScreen onComplete={handlePartners} onBack={() => setStep('welcome')} initialPartner1={answers.partner1Name} initialPartner2={answers.partner2Name} />;
    case 'invite':
      return <PartnerLinkScreen onComplete={handlePartnerLink} onSkip={handlePartnerLinkSkip} onBack={() => setStep('signup')} />;
    case 'season':
      return <SeasonScreen onComplete={handleSeason} onBack={() => setStep('partners')} initialValue={answers.relationshipSeason} />;
    case 'duration':
      return <DurationScreen onComplete={handleDuration} onBack={() => setStep('season')} initialValue={answers.relationshipDuration} />;
    case 'autopilot':
      return <AutopilotScreen onComplete={handleAutopilot} onBack={() => setStep('duration')} initialValue={answers.autopilotLevel} />;
    case 'rich-in':
      return <RichInScreen onComplete={handleRichIn} onBack={() => setStep('autopilot')} initialValue={answers.richIn} initialOtherText={answers.richInOther} />;
    case 'want-more':
      return <WantMoreScreen onComplete={handleWantMore} onBack={() => setStep('rich-in')} initialValue={answers.wantMoreOf} />;
    case 'gets-in-way':
      return <GetsInWayScreen onComplete={handleGetsInWay} onBack={() => setStep('want-more')} initialValue={answers.getsInWay} />;
    case 'love-as-place':
      return <LoveAsPlaceScreen onComplete={handleLoveAsPlace} onBack={() => setStep('gets-in-way')} initialValue={answers.loveAsPlace} />;
    case 'destination':
      return <DestinationScreen onComplete={handleDestination} onBack={() => setStep('love-as-place')} initialValue={answers.destinationFeeling} />;
    case 'wish':
      return <WishScreen onComplete={handleWish} onBack={() => setStep('destination')} initialValue={answers.amoraWish} />;
    case 'signup':
      return <SignupScreen onComplete={handleSignupComplete} onBack={() => setStep('wish')} coupleName={`${answers.partner1Name} & ${answers.partner2Name}`} />;
    case 'complete':
      return <OnboardingCompleteScreen onStart={handleFinalComplete} coupleName={`${answers.partner1Name} & ${answers.partner2Name}`} />;
    default:
      return null;
  }
}