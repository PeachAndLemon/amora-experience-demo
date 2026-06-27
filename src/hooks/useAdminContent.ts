import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AmoraEvent, Activity, Reward } from '@/types/amora';
import { mockEvents } from '@/data/eventData';
import { activities as mockActivities, rewards as mockRewards } from '@/data/mockData';

export function useAdminContent() {
  const [dbEvents, setDbEvents] = useState<AmoraEvent[]>([]);
  const [dbActivities, setDbActivities] = useState<Activity[]>([]);
  const [dbRewards, setDbRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [eventsRes, activitiesRes, rewardsRes] = await Promise.all([
      supabase.from('admin_events').select('*').eq('is_active', true),
      supabase.from('admin_activities').select('*').eq('is_active', true),
      supabase.from('admin_rewards').select('id,name,description,icon_id,type,partner_name,unlock_criteria,is_active,valid_from,valid_until,duration_minutes,redemption_window_hours,created_at,updated_at').eq('is_active', true),
    ]);

    if (eventsRes.data?.length) {
      setDbEvents(eventsRes.data.map(e => ({
        id: e.id,
        name: e.name,
        venue: e.venue,
        location: e.location ?? undefined,
        description: e.description,
        milestoneId: e.milestone_id,
        milestoneCategory: e.milestone_category,
        stampIconId: e.stamp_icon_id,
        stampName: e.stamp_name,
        date: new Date(e.event_date),
        isActive: e.is_active,
        imageUrl: (e as any).image_url ?? undefined,
      })));
    }

    if (activitiesRes.data?.length) {
      setDbActivities(activitiesRes.data.map(a => ({
        id: a.id,
        milestoneId: a.milestone_id,
        title: a.title,
        description: a.description,
        duration: a.duration,
        type: a.type as Activity['type'],
        isCompleted: false,
        prompts: a.prompts ?? undefined,
      })));
    }

    if (rewardsRes.data?.length) {
      setDbRewards(rewardsRes.data.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        iconId: r.icon_id,
        type: r.type as Reward['type'],
        isUnlocked: false,
        partnerName: r.partner_name ?? undefined,
        duration_minutes: (r as any).duration_minutes ?? null,
      })));
    }

    setLoading(false);
  };

  // Merge: DB content takes priority, mock data fills gaps
  const events: AmoraEvent[] = dbEvents.length > 0
    ? [...dbEvents, ...mockEvents.filter(me => !dbEvents.some(de => de.id === me.id))]
    : mockEvents;

  const activities: Activity[] = dbActivities.length > 0
    ? [...dbActivities, ...mockActivities.filter(ma => !dbActivities.some(da => da.id === ma.id))]
    : mockActivities;

  const rewards: Reward[] = dbRewards.length > 0
    ? [...dbRewards, ...mockRewards.filter(mr => !dbRewards.some(dr => dr.id === mr.id))]
    : mockRewards;

  return { events, activities, rewards, loading, refetch: fetchAll };
}
