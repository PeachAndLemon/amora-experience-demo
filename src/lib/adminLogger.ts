import { supabase } from '@/integrations/supabase/client';

export async function logAdminAction(
  actionType: 'create' | 'update' | 'delete',
  entityType: 'event' | 'activity' | 'reward',
  entityId: string,
  entityName: string,
  details?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('admin_changelog').insert({
    admin_user_id: user.id,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    details: details ?? {},
  } as any);
}
