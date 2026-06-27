import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Milestone, Stamp } from '@/types/amora';

export interface MilestoneWithStamps extends Milestone {
  key: string;
  stamps: Stamp[];
  totalStamps: number;
  earnedStamps: number;
  sortOrder: number;
}

export function useUserPassport() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<MilestoneWithStamps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [milestonesRes, stampsRes, earnedRes, activitiesRes, checkinsRes] = await Promise.all([
      supabase.from('admin_milestones').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('admin_stamps').select('*').eq('is_active', true).order('sort_order'),
      user ? supabase.from('earned_stamps').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] as any[] }),
      user ? supabase.from('activity_completions').select('milestone_id').eq('user_id', user.id) : Promise.resolve({ data: [] as any[] }),
      user
        ? supabase
            .from('event_checkins')
            .select('event_id, admin_events:event_id(milestone_id)')
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const ms = (milestonesRes.data ?? []) as any[];
    const stamps = (stampsRes.data ?? []) as any[];
    const earned = (earnedRes.data ?? []) as any[];
    const activityCounts: Record<string, number> = {};
    (activitiesRes.data ?? []).forEach((a: any) => {
      activityCounts[a.milestone_id] = (activityCounts[a.milestone_id] || 0) + 1;
    });
    const checkinCounts: Record<string, number> = {};
    (checkinsRes.data ?? []).forEach((c: any) => {
      const mid = c.admin_events?.milestone_id;
      if (mid) checkinCounts[mid] = (checkinCounts[mid] || 0) + 1;
    });

    const earnedSet = new Set(earned.map((e) => e.stamp_id as string));

    const result: MilestoneWithStamps[] = ms.map((m) => {
      const milestoneStamps: Stamp[] = stamps
        .filter((s) => s.milestone_key === m.key)
        .map((s) => {
          const isEarned = earnedSet.has(s.id);
          const earnedRow = earned.find((e) => e.stamp_id === s.id);
          return {
            id: s.id,
            milestoneId: m.key,
            name: s.name,
            iconId: s.icon_id,
            isEarned,
            earnedAt: earnedRow ? new Date(earnedRow.earned_at) : undefined,
          };
        });

      const total = milestoneStamps.length;
      const earnedCount = milestoneStamps.filter((s) => s.isEarned).length;
      const completed = (activityCounts[m.key] || 0) + (checkinCounts[m.key] || 0);
      const totalForProgress = Math.max(total, 1);

      return {
        id: m.key,
        key: m.key,
        name: m.name,
        description: m.description,
        iconId: m.icon_id,
        color: 'coral',
        progress: total > 0 ? Math.round((earnedCount / totalForProgress) * 100) : 0,
        totalActivities: total,
        completedActivities: earnedCount,
        isUnlocked: true,
        stamps: milestoneStamps,
        totalStamps: total,
        earnedStamps: earnedCount,
        sortOrder: m.sort_order ?? 0,
      };
    });

    setMilestones(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime: refresh when user earns a stamp
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`passport-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'earned_stamps', filter: `user_id=eq.${user.id}` },
        () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchAll]);

  const allStamps = milestones.flatMap((m) => m.stamps);
  const totalEarned = allStamps.filter((s) => s.isEarned).length;
  const totalStamps = allStamps.length;

  return { milestones, allStamps, totalEarned, totalStamps, loading, refetch: fetchAll };
}
