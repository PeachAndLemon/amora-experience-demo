import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ActivityFeedback, PreferenceSignal } from '@/types/amora';
import { useRealtimeSync } from './useRealtimeSync';

interface ActivityCompletion {
  id: string;
  user_id: string;
  activity_id: string;
  milestone_id: string;
  star_rating: number | null;
  preference_signals: string[];
  completed_at: string;
}

interface EventCheckin {
  id: string;
  user_id: string;
  event_id: string;
  stamp_earned: boolean;
  checked_in_at: string;
}

interface EarnedStamp {
  id: string;
  user_id: string;
  stamp_id: string;
  milestone_id: string;
  earned_at: string;
}

export function useActivityData() {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [checkins, setCheckins] = useState<EventCheckin[]>([]);
  const [stamps, setStamps] = useState<EarnedStamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setCompletions([]);
      setCheckins([]);
      setStamps([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = useCallback(async () => {
    if (!user) return;

    const [completionsRes, checkinsRes, stampsRes] = await Promise.all([
      supabase.from('activity_completions').select('*').eq('user_id', user.id),
      supabase.from('event_checkins').select('*').eq('user_id', user.id),
      supabase.from('earned_stamps').select('*').eq('user_id', user.id),
    ]);

    if (completionsRes.data) setCompletions(completionsRes.data);
    if (checkinsRes.data) setCheckins(checkinsRes.data);
    if (stampsRes.data) setStamps(stampsRes.data);
    setLoading(false);
  }, [user]);

  // Subscribe to realtime updates from partner
  useRealtimeSync(fetchAllData);

  const completeActivity = async (
    activityId: string,
    milestoneId: string,
    feedback?: { starRating: number; preferenceSignals: PreferenceSignal[] }
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('activity_completions')
      .upsert({
        user_id: user.id,
        activity_id: activityId,
        milestone_id: milestoneId,
        star_rating: feedback?.starRating || null,
        preference_signals: feedback?.preferenceSignals || [],
      });

    if (!error) {
      await fetchAllData();
    }

    return { error };
  };

  const checkInToEvent = async (eventId: string, stampEarned: boolean = true) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('event_checkins')
      .upsert({
        user_id: user.id,
        event_id: eventId,
        stamp_earned: stampEarned,
      });

    if (!error) {
      await fetchAllData();
    }

    return { error };
  };

  const earnStamp = async (stampId: string, milestoneId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('earned_stamps')
      .upsert({
        user_id: user.id,
        stamp_id: stampId,
        milestone_id: milestoneId,
      });

    if (!error) {
      await fetchAllData();
    }

    return { error };
  };

  // Convert to ActivityFeedback format for compatibility
  const getActivityFeedback = (): ActivityFeedback[] => {
    return completions
      .filter(c => c.star_rating !== null)
      .map(c => ({
        activityId: c.activity_id,
        starRating: c.star_rating!,
        preferenceSignals: c.preference_signals as PreferenceSignal[],
        completedAt: new Date(c.completed_at),
      }));
  };

  const isActivityCompleted = (activityId: string) => 
    completions.some(c => c.activity_id === activityId);

  const isEventCheckedIn = (eventId: string) => 
    checkins.some(c => c.event_id === eventId);

  const isStampEarned = (stampId: string) => 
    stamps.some(s => s.stamp_id === stampId);

  return {
    completions,
    checkins,
    stamps,
    loading,
    completeActivity,
    checkInToEvent,
    earnStamp,
    getActivityFeedback,
    isActivityCompleted,
    isEventCheckedIn,
    isStampEarned,
    refetch: fetchAllData,
  };
}
