import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  OnboardingStep, 
  PassportData, 
  DeepOnboardingAnswers, 
  CoupleGoals 
} from '@/types/amora';
import { milestones, stamps } from '@/data/mockData';
import { WantMoreOf, GetsInWay } from '@/types/amora';
import { synthesizeCoupleGoals } from '@/lib/goalSynthesis';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AmoraContextType {
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  passportData: PassportData;
  currentLevel: number;
  deepOnboardingAnswers: DeepOnboardingAnswers;
  setDeepOnboardingAnswers: (answers: DeepOnboardingAnswers) => void;
  updateDeepOnboardingAnswers: (updates: Partial<DeepOnboardingAnswers>) => void;
  coupleGoals: CoupleGoals | null;
  setCoupleGoals: (goals: CoupleGoals) => void;
  finalizeCoupleGoals: () => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// Default passport data for NEW users - clean slate
const getDefaultPassportData = (userProfile: UserProfile | null): PassportData => {
  let displayName = '';
  if (userProfile) {
    if (userProfile.partnerConnected && userProfile.partner2Name) {
      displayName = `${userProfile.partner1Name} & ${userProfile.partner2Name}`;
    } else {
      displayName = userProfile.partner1Name || '';
    }
  }
  
  return {
    level: 1,
    totalStamps: 12,
    earnedStamps: 0,
    coupleName: displayName,
    startDate: userProfile?.startDate || new Date(),
    milestones: milestones.map(m => ({ ...m, progress: 0, completedActivities: 0 })),
    stamps: stamps.map(s => ({ ...s, isEarned: false, earnedAt: undefined })),
  };
};

const defaultDeepOnboardingAnswers: DeepOnboardingAnswers = {
  partner1Name: '',
  partner2Name: '',
  relationshipSeason: null,
  relationshipDuration: null,
  autopilotLevel: 5,
  richIn: null,
  wantMoreOf: [],
  getsInWay: null,
  loveAsPlace: '',
  destinationFeeling: null,
  amoraWish: '',
  growthDirections: [],
  currentDynamic: null,
  experienceStyle: null,
  behavioralIntents: [],
  behavioralFreeText: undefined,
  amoraIntention: null,
};

const AmoraContext = createContext<AmoraContextType | undefined>(undefined);

export function AmoraProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut: authSignOut } = useAuth();
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [deepOnboardingAnswers, setDeepOnboardingAnswersState] = useState<DeepOnboardingAnswers>(defaultDeepOnboardingAnswers);
  const [coupleGoals, setCoupleGoalsState] = useState<CoupleGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from database when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadUserData();
    } else {
      // Not authenticated - reset to defaults
      setIsOnboardedState(false);
      setUserProfileState(null);
      setDeepOnboardingAnswersState(defaultDeepOnboardingAnswers);
      setCoupleGoalsState(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadUserData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, partner1_name, partner2_name, couple_name, relationship_season, relationship_duration, start_date, partner_id, partner_connected, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch onboarding answers
      const { data: answers, error: answersError } = await supabase
        .from('onboarding_answers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (answersError && answersError.code !== 'PGRST116') {
        console.error('Error fetching onboarding answers:', answersError);
      }

      // User is onboarded if profile exists with partner1_name filled
      const hasCompletedOnboarding = profile && profile.partner1_name && profile.partner1_name.trim() !== '';
      
      if (hasCompletedOnboarding) {
        // User has completed onboarding - load their data
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

        setUserProfileState(loadedProfile);
        setIsOnboardedState(true);

        if (answers) {
          const loadedAnswers: DeepOnboardingAnswers = {
            partner1Name: profile.partner1_name,
            partner2Name: profile.partner2_name,
            relationshipSeason: profile.relationship_season as DeepOnboardingAnswers['relationshipSeason'],
            relationshipDuration: profile.relationship_duration as DeepOnboardingAnswers['relationshipDuration'],
            autopilotLevel: answers.autopilot_level || 5,
            richIn: answers.rich_in as DeepOnboardingAnswers['richIn'],
            richInOther: answers.rich_in_other || '',
            wantMoreOf: (answers.want_more_of || []) as WantMoreOf[],
            getsInWay: (answers.gets_in_way || []) as GetsInWay[],
            loveAsPlace: answers.love_as_place || '',
            destinationFeeling: answers.destination_feeling as DeepOnboardingAnswers['destinationFeeling'],
            amoraWish: answers.amora_wish || '',
            growthDirections: [],
            currentDynamic: null,
            experienceStyle: null,
            behavioralIntents: [],
            amoraIntention: null,
          };
          setDeepOnboardingAnswersState(loadedAnswers);
          
          const goals = synthesizeCoupleGoals(loadedAnswers);
          setCoupleGoalsState(goals);
        }
      } else {
        // User exists but hasn't completed onboarding
        setIsOnboardedState(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passportData: PassportData = getDefaultPassportData(userProfile);

  const setIsOnboarded = (value: boolean) => {
    setIsOnboardedState(value);
  };

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
  };

  const setDeepOnboardingAnswers = (answers: DeepOnboardingAnswers) => {
    setDeepOnboardingAnswersState(answers);
  };

  const setCoupleGoals = (goals: CoupleGoals) => {
    setCoupleGoalsState(goals);
  };

  const updateDeepOnboardingAnswers = (updates: Partial<DeepOnboardingAnswers>) => {
    setDeepOnboardingAnswersState(prev => ({ ...prev, ...updates }));
  };

  const finalizeCoupleGoals = () => {
    const goals = synthesizeCoupleGoals(deepOnboardingAnswers);
    setCoupleGoalsState(goals);
  };

  const signOut = async () => {
    await authSignOut();
    setIsOnboardedState(false);
    setUserProfileState(null);
    setDeepOnboardingAnswersState(defaultDeepOnboardingAnswers);
    setCoupleGoalsState(null);
  };

  const value: AmoraContextType = {
    isOnboarded,
    setIsOnboarded,
    onboardingStep,
    setOnboardingStep,
    userProfile,
    setUserProfile,
    passportData,
    currentLevel: passportData.level,
    deepOnboardingAnswers,
    setDeepOnboardingAnswers,
    updateDeepOnboardingAnswers,
    coupleGoals,
    setCoupleGoals,
    finalizeCoupleGoals,
    isLoading: isLoading || authLoading,
    signOut,
  };

  return <AmoraContext.Provider value={value}>{children}</AmoraContext.Provider>;
}

export function useAmora() {
  const context = useContext(AmoraContext);
  if (context === undefined) {
    throw new Error('useAmora must be used within an AmoraProvider');
  }
  return context;
}