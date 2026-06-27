import { useMemo } from 'react';
import { CoupleGoals, ActivityFeedback, AmoraEvent, Activity, GrowthDirection } from '@/types/amora';
import { mockEvents } from '@/data/eventData';
import { activities as mockActivities } from '@/data/mockData';

export interface RankedEvent {
  event: AmoraEvent;
  score: number;
  isRecommended: boolean;
}

const milestoneToGoal: Record<string, GrowthDirection> = {
  'sync-up': 'quality-time',
  'soulstice': 'less-stress',
  'dig-deep': 'communication',
  'in-touch': 'physical-closeness',
  'seeds-appreciation': 'feeling-appreciated',
  'dual-delight': 'emotional-connection',
  'amazed': 'team-again',
  'visionaries': 'aligned-future',
  'masterpiece': 'fun-playfulness',
};

interface PreferenceScores {
  wantsMoreLikeThis: Set<string>;
  wantsFewerLikeThis: Set<string>;
  meaningfulPreferred: boolean;
  funPreferred: boolean;
}

function buildPreferenceScores(feedback: ActivityFeedback[], activitiesList: Activity[]): PreferenceScores {
  const scores: PreferenceScores = {
    wantsMoreLikeThis: new Set(),
    wantsFewerLikeThis: new Set(),
    meaningfulPreferred: false,
    funPreferred: false,
  };

  feedback.forEach(fb => {
    const activity = activitiesList.find(a => a.id === fb.activityId);
    if (!activity) return;

    fb.preferenceSignals.forEach(signal => {
      switch (signal) {
        case 'more-like-this':
          scores.wantsMoreLikeThis.add(activity.milestoneId);
          break;
        case 'fewer-like-this':
          scores.wantsFewerLikeThis.add(activity.milestoneId);
          break;
        case 'especially-meaningful':
          scores.meaningfulPreferred = true;
          break;
        case 'fun-but-light':
          scores.funPreferred = true;
          break;
      }
    });
  });

  return scores;
}

function scoreEvent(
  event: AmoraEvent,
  goals: CoupleGoals | null,
  prefs: PreferenceScores
): number {
  let score = 100;

  if (goals) {
    const eventGoal = milestoneToGoal[event.milestoneId];
    if (eventGoal && goals.primaryGoals.includes(eventGoal)) score += 30;
    if (goals.prioritizesEvents) score += 25;
    if (goals.wantMoreOf?.includes('play-laughter') && event.milestoneId === 'masterpiece') score += 20;
    if (goals.wantMoreOf?.includes('presence-deep-talks') && event.milestoneId === 'dig-deep') score += 20;
    if (goals.wantMoreOf?.includes('romance-desire') && event.milestoneId === 'soulstice') score += 20;
    if (goals.wantMoreOf?.includes('adventure-challenge') && event.milestoneId === 'visionaries') score += 20;
    if (goals.wantMoreOf?.includes('creating-together') && event.milestoneId === 'masterpiece') score += 20;
    if (goals.sharedStyle === 'playful-adventurous' && event.milestoneId === 'masterpiece') score += 15;
    if (goals.sharedStyle === 'deep-meaningful' && event.milestoneId === 'dig-deep') score += 15;
  }

  if (prefs.wantsMoreLikeThis.has(event.milestoneId)) score += 20;
  if (prefs.wantsFewerLikeThis.has(event.milestoneId)) score -= 40;
  if (prefs.meaningfulPreferred && ['soulstice', 'dig-deep', 'amazed'].includes(event.milestoneId)) score += 10;
  if (prefs.funPreferred && ['masterpiece', 'sync-up'].includes(event.milestoneId)) score += 10;

  return score;
}

export function useRankedEvents(
  coupleGoals: CoupleGoals | null,
  feedback: ActivityFeedback[],
  events?: AmoraEvent[],
  activitiesList?: Activity[]
): RankedEvent[] {
  return useMemo(() => {
    const eventSource = events ?? mockEvents;
    const activitySource = activitiesList ?? mockActivities;
    const activeEvents = eventSource.filter(e => e.isActive);
    const preferenceScores = buildPreferenceScores(feedback, activitySource);

    const scoredEvents = activeEvents.map(event => ({
      event,
      score: scoreEvent(event, coupleGoals, preferenceScores),
      isRecommended: false,
    }));

    scoredEvents.sort((a, b) => b.score - a.score);

    scoredEvents.forEach((item, index) => {
      if (index < 3) item.isRecommended = true;
    });

    return scoredEvents;
  }, [coupleGoals, feedback, events, activitiesList]);
}
