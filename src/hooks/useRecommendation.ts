import { useMemo } from 'react';
import { CoupleGoals, ActivityFeedback, Activity, AmoraEvent, GrowthDirection } from '@/types/amora';
import { activities as mockActivities } from '@/data/mockData';
import { mockEvents } from '@/data/eventData';

interface Recommendation {
  type: 'activity' | 'event';
  item: Activity | AmoraEvent;
  reason: string;
  priority: number;
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

export function useRecommendation(
  coupleGoals: CoupleGoals | null,
  feedback: ActivityFeedback[],
  activitiesList?: Activity[],
  eventsList?: AmoraEvent[]
): Recommendation | null {
  return useMemo(() => {
    const activities = activitiesList ?? mockActivities;
    const events = eventsList ?? mockEvents;
    const incompleteActivities = activities.filter(a => !a.isCompleted);
    const activeEvents = events.filter(e => e.isActive);
    
    const preferenceScores = buildPreferenceScores(feedback, activities);
    const candidates: Recommendation[] = [];
    
    activeEvents.forEach(event => {
      const score = scoreEvent(event, coupleGoals, preferenceScores);
      candidates.push({
        type: 'event',
        item: event,
        reason: getEventReason(event, coupleGoals),
        priority: score,
      });
    });
    
    incompleteActivities.forEach(activity => {
      const score = scoreActivity(activity, coupleGoals, preferenceScores);
      candidates.push({
        type: 'activity',
        item: activity,
        reason: getActivityReason(activity, coupleGoals),
        priority: score,
      });
    });
    
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0] || null;
  }, [coupleGoals, feedback, activitiesList, eventsList]);
}

interface PreferenceScores {
  wantsMoreLikeThis: Set<string>;
  wantsFewerLikeThis: Set<string>;
  wantsVariety: boolean;
  meaningfulPreferred: boolean;
  funPreferred: boolean;
}

function buildPreferenceScores(feedback: ActivityFeedback[], activities: Activity[]): PreferenceScores {
  const scores: PreferenceScores = {
    wantsMoreLikeThis: new Set(),
    wantsFewerLikeThis: new Set(),
    wantsVariety: false,
    meaningfulPreferred: false,
    funPreferred: false,
  };
  
  feedback.forEach(fb => {
    const activity = activities.find(a => a.id === fb.activityId);
    if (!activity) return;
    
    fb.preferenceSignals.forEach(signal => {
      switch (signal) {
        case 'more-like-this': scores.wantsMoreLikeThis.add(activity.milestoneId); break;
        case 'fewer-like-this': scores.wantsFewerLikeThis.add(activity.milestoneId); break;
        case 'want-variety': scores.wantsVariety = true; break;
        case 'especially-meaningful': scores.meaningfulPreferred = true; break;
        case 'fun-but-light': scores.funPreferred = true; break;
      }
    });
  });
  
  return scores;
}

function scoreEvent(event: AmoraEvent, goals: CoupleGoals | null, prefs: PreferenceScores): number {
  let score = 100;
  if (goals) {
    const eventGoal = milestoneToGoal[event.milestoneId];
    if (eventGoal && goals.primaryGoals.includes(eventGoal)) score += 30;
    if (goals.prioritizesEvents) score += 25;
    if (goals.sharedStyle === 'playful-adventurous' && event.milestoneId === 'masterpiece') score += 15;
    if (goals.sharedStyle === 'deep-meaningful' && event.milestoneId === 'dig-deep') score += 15;
  }
  if (prefs.wantsMoreLikeThis.has(event.milestoneId)) score += 20;
  if (prefs.wantsFewerLikeThis.has(event.milestoneId)) score -= 40;
  if (prefs.meaningfulPreferred && ['soulstice', 'dig-deep', 'amazed'].includes(event.milestoneId)) score += 10;
  if (prefs.funPreferred && ['masterpiece', 'sync-up'].includes(event.milestoneId)) score += 10;
  return score;
}

function scoreActivity(activity: Activity, goals: CoupleGoals | null, prefs: PreferenceScores): number {
  let score = 50;
  if (goals) {
    const activityGoal = milestoneToGoal[activity.milestoneId];
    if (activityGoal && goals.primaryGoals.includes(activityGoal)) score += 25;
    if (goals.activityPacing === 'slow' && activity.type === 'mindfulness') score += 10;
    if (goals.activityPacing === 'energetic' && activity.type === 'conversation') score += 10;
  }
  if (prefs.wantsMoreLikeThis.has(activity.milestoneId)) score += 15;
  if (prefs.wantsFewerLikeThis.has(activity.milestoneId)) score -= 30;
  if (prefs.wantsVariety) score += Math.random() * 10;
  if (prefs.meaningfulPreferred && activity.type === 'conversation') score += 10;
  if (prefs.funPreferred && ['creative', 'physical'].includes(activity.type)) score += 10;
  return score;
}

function getEventReason(event: AmoraEvent, goals: CoupleGoals | null): string {
  if (goals) {
    const eventGoal = milestoneToGoal[event.milestoneId];
    if (eventGoal && goals.primaryGoals.includes(eventGoal))
      return `Aligns with your ${event.milestoneCategory} goals — this happens in real life`;
    if (goals.prioritizesEvents) return 'Based on your love for trying new experiences together';
  }
  return 'A real-world moment to step away from screens together';
}

function getActivityReason(activity: Activity, goals: CoupleGoals | null): string {
  if (goals) {
    const activityGoal = milestoneToGoal[activity.milestoneId];
    if (activityGoal && goals.primaryGoals.includes(activityGoal)) return 'Perfect for your focus on deeper connection';
    if (goals.sharedStyle === 'playful-adventurous' && activity.type === 'creative') return 'Matches your playful style';
    if (goals.sharedStyle === 'deep-meaningful' && activity.type === 'conversation') return 'For the meaningful conversations you love';
  }
  return 'Based on what you\'ve enjoyed most';
}
