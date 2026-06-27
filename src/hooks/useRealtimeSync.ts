import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Subscribes to realtime changes on activity_completions, earned_stamps,
 * and event_checkins for the current user and their partner.
 * Calls the provided callback whenever a change occurs so the UI can refetch.
 */
export function useRealtimeSync(onUpdate: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('partner-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_completions' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'earned_stamps' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_checkins' },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}
