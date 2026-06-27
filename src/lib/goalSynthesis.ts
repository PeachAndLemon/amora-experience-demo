import { 
  DeepOnboardingAnswers, 
  CoupleGoals, 
  GrowthDirection,
  ExperienceStyle 
} from '@/types/amora';

/**
 * Synthesizes couple goals from individual onboarding answers.
 * 
 * Rules:
 * - Shared selections → become Primary Couple Goals
 * - Complementary selections → balanced activity mix
 * - Conflicting styles → alternating activity pacing
 */
export function synthesizeCoupleGoals(
  userAnswers: DeepOnboardingAnswers,
  partnerAnswers?: DeepOnboardingAnswers
): CoupleGoals {
  // For MVP, we use the single user's answers
  // In full implementation, we'd merge both partners' answers
  
  const answers = userAnswers;
  const partner = partnerAnswers || userAnswers; // Fallback to same answers for MVP

  // Determine primary goals from growth directions
  const primaryGoals = determinePrimaryGoals(
    answers.growthDirections,
    partner.growthDirections
  );

  // Determine shared experience style
  const sharedStyle = determineSharedStyle(
    answers.experienceStyle,
    partner.experienceStyle
  );

  // Determine focus areas based on behavioral intents
  const focusAreas = determineFocusAreas(
    answers.behavioralIntents,
    partner.behavioralIntents
  );

  // Determine activity pacing based on current dynamics
  const activityPacing = determineActivityPacing(
    answers.currentDynamic,
    partner.currentDynamic,
    answers.experienceStyle,
    partner.experienceStyle
  );

  // Check if events should be prioritized
  const prioritizesEvents = 
    answers.behavioralIntents.includes('try-new-experiences') ||
    partner.behavioralIntents.includes('try-new-experiences');

  return {
    primaryGoals,
    sharedStyle,
    focusAreas,
    activityPacing,
    prioritizesEvents,
  };
}

function determinePrimaryGoals(
  userGoals: GrowthDirection[],
  partnerGoals: GrowthDirection[]
): GrowthDirection[] {
  // Find shared goals first (highest priority)
  const shared = userGoals.filter(g => partnerGoals.includes(g));
  
  // Add unique goals from each partner
  const allGoals = [...new Set([...shared, ...userGoals, ...partnerGoals])];
  
  // Return top 3 goals, prioritizing shared ones
  return allGoals.slice(0, 3);
}

function determineSharedStyle(
  userStyle: ExperienceStyle | null,
  partnerStyle: ExperienceStyle | null
): ExperienceStyle | null {
  // If same style, use it
  if (userStyle === partnerStyle) {
    return userStyle;
  }

  // If one is null, use the other
  if (!userStyle) return partnerStyle;
  if (!partnerStyle) return userStyle;

  // Map complementary styles
  const complementaryPairs: Record<ExperienceStyle, ExperienceStyle[]> = {
    'light-fun': ['playful-adventurous', 'creative-expressive'],
    'deep-meaningful': ['calm-grounding', 'romantic-intimate'],
    'calm-grounding': ['deep-meaningful', 'romantic-intimate'],
    'playful-adventurous': ['light-fun', 'creative-expressive'],
    'creative-expressive': ['light-fun', 'playful-adventurous'],
    'romantic-intimate': ['deep-meaningful', 'calm-grounding'],
  };

  // Check if styles are complementary
  if (complementaryPairs[userStyle]?.includes(partnerStyle)) {
    // Return a balanced style
    return userStyle; // Alternate between the two
  }

  // Default to user's style
  return userStyle;
}

function determineFocusAreas(
  userIntents: string[],
  partnerIntents: string[]
): string[] {
  const intentToFocus: Record<string, string> = {
    'try-new-experiences': 'Adventure',
    'meaningful-topics': 'Communication',
    'laugh-more': 'Playfulness',
    'slow-down-present': 'Mindfulness',
    'create-together': 'Creativity',
    'shared-goals': 'Partnership',
    'reconnect-physically': 'Intimacy',
  };

  const allIntents = [...new Set([...userIntents, ...partnerIntents])];
  return allIntents.map(intent => intentToFocus[intent] || intent).filter(Boolean);
}

function determineActivityPacing(
  userDynamic: string | null,
  partnerDynamic: string | null,
  userStyle: string | null,
  partnerStyle: string | null
): 'slow' | 'balanced' | 'energetic' {
  // Dynamics that suggest slower pacing
  const slowDynamics = ['busy-out-of-sync', 'hoping-for-reset', 'little-disconnected'];
  
  // Dynamics that suggest balanced pacing
  const balancedDynamics = ['content-wanting-depth', 'stuck-in-routine'];
  
  // Dynamics that suggest energetic pacing
  const energeticDynamics = ['excited-wanting-direction'];

  // Check if either partner needs slower pacing
  if (
    (userDynamic && slowDynamics.includes(userDynamic)) ||
    (partnerDynamic && slowDynamics.includes(partnerDynamic))
  ) {
    return 'slow';
  }

  // Check for energetic dynamics
  if (
    (userDynamic && energeticDynamics.includes(userDynamic)) ||
    (partnerDynamic && energeticDynamics.includes(partnerDynamic))
  ) {
    // But if styles are conflicting, balance it
    if (userStyle !== partnerStyle && userStyle && partnerStyle) {
      return 'balanced';
    }
    return 'energetic';
  }

  return 'balanced';
}

/**
 * Maps couple goals to recommended pillar focus
 * Updated for 6 core relationship pillars
 */
export function getMilestonePriority(goals: CoupleGoals): string[] {
  const priorityMap: Record<GrowthDirection, string> = {
    'communication': 'Sync Up',
    'quality-time': 'Soulstice',
    'fun-playfulness': 'The Canvas',
    'emotional-connection': 'Dig Deep',
    'physical-closeness': 'Soulstice',
    'less-stress': 'Dig Deep',
    'aligned-future': 'Altitude Resilience',
    'feeling-appreciated': 'The Glow',
    'team-again': 'Altitude Resilience',
  };

  return goals.primaryGoals
    .map(goal => priorityMap[goal])
    .filter(Boolean);
}

/**
 * Determines if an activity matches couple goals
 */
export function activityMatchesGoals(
  activityType: string,
  goals: CoupleGoals
): number {
  let score = 0;

  // Type matching
  const typeToFocus: Record<string, string[]> = {
    'conversation': ['Communication', 'Partnership'],
    'physical': ['Intimacy', 'Playfulness'],
    'creative': ['Creativity', 'Playfulness'],
    'mindfulness': ['Mindfulness', 'Communication'],
  };

  const matchingFocuses = typeToFocus[activityType] || [];
  for (const focus of matchingFocuses) {
    if (goals.focusAreas.includes(focus)) {
      score += 2;
    }
  }

  // Style matching
  const styleToTypes: Record<string, string[]> = {
    'light-fun': ['creative', 'physical'],
    'deep-meaningful': ['conversation', 'mindfulness'],
    'calm-grounding': ['mindfulness', 'conversation'],
    'playful-adventurous': ['physical', 'creative'],
    'creative-expressive': ['creative'],
    'romantic-intimate': ['physical', 'conversation'],
  };

  if (goals.sharedStyle && styleToTypes[goals.sharedStyle]?.includes(activityType)) {
    score += 3;
  }

  return score;
}
