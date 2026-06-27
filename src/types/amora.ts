export interface Milestone {
  id: string;
  name: string;
  description: string;
  iconId: string; // Changed from icon (emoji) to iconId (Lucide icon key)
  color: string;
  progress: number;
  totalActivities: number;
  completedActivities: number;
  isUnlocked: boolean;
}

export interface Stamp {
  id: string;
  milestoneId: string;
  name: string;
  iconId: string; // Changed from icon (emoji) to iconId (Lucide icon key)
  earnedAt?: Date;
  isEarned: boolean;
}

export interface Activity {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  duration: string;
  type: 'conversation' | 'physical' | 'creative' | 'mindfulness';
  isCompleted: boolean;
  prompts?: string[];
  isEvent?: boolean;
  eventId?: string;
}

export interface AmoraEvent {
  id: string;
  name: string;
  venue: string;
  location?: string;
  description: string;
  milestoneId: string;
  milestoneCategory: string;
  stampIconId: string; // Changed from stampIcon (emoji) to stampIconId (Lucide icon key)
  stampName: string;
  date: Date;
  isActive: boolean;
  imageUrl?: string;
}

export interface ActivityFeedback {
  activityId: string;
  starRating: number;
  preferenceSignals: PreferenceSignal[];
  completedAt: Date;
}

export type PreferenceSignal = 
  | 'more-like-this'
  | 'fewer-like-this'
  | 'liked-not-now'
  | 'want-variety'
  | 'especially-meaningful'
  | 'fun-but-light';

export interface Reward {
  id: string;
  name: string;
  description: string;
  iconId: string;
  type: 'perk' | 'experience' | 'partner_reward';
  isUnlocked: boolean;
  unlockedAt?: Date;
  partnerName?: string;
  duration_minutes?: number | null;
}

export interface PassportData {
  level: number;
  totalStamps: number;
  earnedStamps: number;
  coupleName: string;
  startDate: Date;
  milestones: Milestone[];
  stamps: Stamp[];
}

export interface UserProfile {
  partner1Name: string;
  partner2Name: string;
  coupleName: string;
  relationshipSeason: RelationshipSeason;
  relationshipDuration: RelationshipDuration;
  startDate: Date;
  preferences: string[];
  partnerEmail?: string;
  partnerConnected: boolean;
  // Legacy field for compatibility
  relationshipStage?: 'dating' | 'long-term' | 'engaged' | 'married';
}

// Love Passport Check-In Types
export type RelationshipSeason = 
  | 'building'      // Building — laying your foundation
  | 'committed'     // Committed — growing as a team
  | 'established';  // Established — keeping the spark alive

export type RelationshipDuration = 
  | '0-2'
  | '2-5'
  | '5-10'
  | '10+';

export type RichIn = 
  | 'trust-reliability'
  | 'life-logistics'
  | 'ideas-ambition'
  | 'comfort-familiarity'
  | 'other';

export type WantMoreOf = 
  | 'play-laughter'
  | 'creating-together'
  | 'presence-deep-talks'
  | 'romance-desire'
  | 'adventure-challenge';

export type GetsInWay = 
  | 'mental-overload'
  | 'screens-distraction'
  | 'same-routine'
  | 'side-by-side';

export type DestinationFeeling = 
  | 'attunement'    // Feeling in sync
  | 'vitality'      // Spark & energy
  | 'safe-haven'    // Peace & comfort
  | 'co-adventure'; // Building something big

// Deep Onboarding Answers for Love Passport Check-In
export interface DeepOnboardingAnswers {
  // Core fields
  partner1Name: string;
  partner2Name: string;
  relationshipSeason: RelationshipSeason | null;
  relationshipDuration: RelationshipDuration | null;
  autopilotLevel: number; // 1-10
  richIn: RichIn | null;
  richInOther?: string; // free text when "other" is selected
  wantMoreOf: WantMoreOf[]; // multi-select
  getsInWay: GetsInWay[]; // multi-select
  loveAsPlace: string; // free text
  destinationFeeling: DestinationFeeling | null;
  amoraWish: string; // free text

  // Legacy fields for compatibility
  growthDirections: GrowthDirection[];
  currentDynamic: CurrentDynamic | null;
  experienceStyle: ExperienceStyle | null;
  behavioralIntents: BehavioralIntent[];
  behavioralFreeText?: string;
  amoraIntention: AmoraIntention | null;
}

// Legacy types for compatibility
export type GrowthDirection = 
  | 'communication'
  | 'quality-time'
  | 'fun-playfulness'
  | 'emotional-connection'
  | 'physical-closeness'
  | 'less-stress'
  | 'aligned-future'
  | 'feeling-appreciated'
  | 'team-again';

export type CurrentDynamic = 
  | 'content-wanting-depth'
  | 'little-disconnected'
  | 'busy-out-of-sync'
  | 'stuck-in-routine'
  | 'excited-wanting-direction'
  | 'hoping-for-reset';

export type ExperienceStyle = 
  | 'light-fun'
  | 'deep-meaningful'
  | 'calm-grounding'
  | 'playful-adventurous'
  | 'creative-expressive'
  | 'romantic-intimate';

export type BehavioralIntent = 
  | 'try-new-experiences'
  | 'meaningful-topics'
  | 'laugh-more'
  | 'slow-down-present'
  | 'create-together'
  | 'shared-goals'
  | 'reconnect-physically';

export type AmoraIntention = 
  | 'strengthen-good'
  | 'reconnect-busy'
  | 'work-through-stuck'
  | 'better-communication'
  | 'meaningful-memories'
  | 'grow-intentionally';

export interface CoupleGoals {
  primaryGoals: GrowthDirection[];
  sharedStyle: ExperienceStyle | null;
  focusAreas: string[];
  activityPacing: 'slow' | 'balanced' | 'energetic';
  prioritizesEvents: boolean;
  // New fields from Love Passport Check-In
  destinationFeeling?: DestinationFeeling;
  wantMoreOf?: WantMoreOf[];
  autopilotLevel?: number;
}

export type OnboardingStep = 
  | 'welcome' 
  | 'login'
  | 'partners'
  | 'partner-link'
  | 'season'
  | 'duration'
  | 'autopilot'
  | 'rich-in'
  | 'want-more'
  | 'gets-in-way'
  | 'love-as-place'
  | 'destination'
  | 'wish'
  | 'signup'
  | 'complete'
  // Legacy steps for compatibility
  | 'story' 
  | 'create' 
  | 'invite' 
  | 'preferences'
  | 'growth-direction'
  | 'current-dynamic'
  | 'experience-style'
  | 'behavioral-intent'
  | 'amora-intention';
