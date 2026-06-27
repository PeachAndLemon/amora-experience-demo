import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminRewardForm } from './AdminRewardForm';
import { AdminDeleteDialog } from './AdminDeleteDialog';
import { rewards as mockRewards } from '@/data/mockData';
import { logAdminAction } from '@/lib/adminLogger';

interface AdminReward {
  id: string;
  name: string;
  description: string;
  icon_id: string;
  type: string;
  partner_name: string | null;
  unlock_criteria: string | null;
  is_active: boolean;
  isMock?: boolean;
}

export function AdminRewardsTab() {
  const [dbRewards, setDbRewards] = useState<AdminReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminReward | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReward | null>(null);

  const fetchData = async () => {
    // Admin-only RPC returns full reward rows including the sensitive `code` field.
    const { data } = await supabase.rpc('admin_list_rewards');
    if (data) setDbRewards(data as AdminReward[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const mockMapped: AdminReward[] = mockRewards.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon_id: r.iconId,
    type: r.type,
    partner_name: r.partnerName ?? null,
    unlock_criteria: null,
    is_active: true,
    isMock: true,
  }));

  const allRewards = [
    ...dbRewards,
    ...mockMapped.filter(m => !dbRewards.some(d => d.id === m.id)),
  ];

  const toggleActive = async (item: AdminReward) => {
    if (item.isMock) {
      await supabase.from('admin_rewards').insert({
        id: item.id,
        name: item.name,
        description: item.description,
        icon_id: item.icon_id,
        type: item.type,
        partner_name: item.partner_name,
        unlock_criteria: item.unlock_criteria,
        is_active: !item.is_active,
      });
    } else {
      const { error } = await supabase.from('admin_rewards').update({ is_active: !item.is_active }).eq('id', item.id);
      if (error) { toast.error('Failed to update'); return; }
    }
    await logAdminAction('update', 'reward', item.id, item.name, { field: 'is_active', newValue: !item.is_active });
    toast.success(item.is_active ? 'Reward deactivated' : 'Reward activated');
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isMock) {
      await supabase.from('admin_rewards').insert({
        id: deleteTarget.id,
        name: deleteTarget.name,
        description: deleteTarget.description,
        icon_id: deleteTarget.icon_id,
        type: deleteTarget.type,
        partner_name: deleteTarget.partner_name,
        unlock_criteria: deleteTarget.unlock_criteria,
        is_active: false,
      });
    } else {
      const { error } = await supabase.from('admin_rewards').delete().eq('id', deleteTarget.id);
      if (error) { toast.error('Failed to delete'); return; }
    }
    await logAdminAction('delete', 'reward', deleteTarget.id, deleteTarget.name);
    toast.success('Reward deleted');
    setDeleteTarget(null);
    fetchData();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); fetchData(); };

  if (showForm || editing) {
    return <AdminRewardForm reward={editing} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={() => setShowForm(true)} className="w-full rounded-2xl gap-2">
        <Plus className="w-4 h-4" /> Add Reward
      </Button>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : allRewards.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No rewards yet.</p>
      ) : (
        allRewards.map((item) => (
          <Card key={item.id} className={`rounded-2xl ${!item.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    {item.isMock && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        <Database className="w-2.5 h-2.5 mr-0.5" />mock
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.type}{item.partner_name ? ` • ${item.partner_name}` : ''}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActive(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    {item.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AdminDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name ?? ''}
        itemType="reward"
      />
    </div>
  );
}
