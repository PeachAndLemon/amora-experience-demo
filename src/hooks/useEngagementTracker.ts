import { supabase } from '@/integrations/supabase/client';

export type EngagementType = 'view' | 'start' | 'complete' | 'checkin' | 'unlock' | 'share';
export type EntityType = 'event' | 'activity' | 'reward';

export async function trackEngagement(
  engagementType: EngagementType,
  entityType: EntityType,
  entityId: string,
  entityName: string = '',
  metadata?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_engagement').insert({
    user_id: user.id,
    engagement_type: engagementType,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    metadata: metadata ?? {},
  } as any);
}
