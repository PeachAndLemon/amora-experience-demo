import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminActivityForm } from './AdminActivityForm';
import { AdminDeleteDialog } from './AdminDeleteDialog';
import { activities as mockActivities } from '@/data/mockData';
import { logAdminAction } from '@/lib/adminLogger';

interface AdminActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  milestone_id: string;
  prompts: string[] | null;
  is_active: boolean;
  isMock?: boolean;
}

export function AdminActivitiesTab() {
  const [dbActivities, setDbActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminActivity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminActivity | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from('admin_activities').select('*').order('created_at', { ascending: false });
    if (data) setDbActivities(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const mockMapped: AdminActivity[] = mockActivities.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    duration: a.duration,
    type: a.type,
    milestone_id: a.milestoneId,
    prompts: a.prompts ?? null,
    is_active: true,
    isMock: true,
  }));

  const allActivities = [
    ...dbActivities,
    ...mockMapped.filter(m => !dbActivities.some(d => d.id === m.id)),
  ];

  const toggleActive = async (item: AdminActivity) => {
    if (item.isMock) {
      await supabase.from('admin_activities').insert({
        id: item.id,
        title: item.title,
        description: item.description,
        duration: item.duration,
        type: item.type,
        milestone_id: item.milestone_id,
        prompts: item.prompts,
        is_active: !item.is_active,
      });
    } else {
      const { error } = await supabase.from('admin_activities').update({ is_active: !item.is_active }).eq('id', item.id);
      if (error) { toast.error('Failed to update'); return; }
    }
    await logAdminAction('update', 'activity', item.id, item.title, { field: 'is_active', newValue: !item.is_active });
    toast.success(item.is_active ? 'Activity deactivated' : 'Activity activated');
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isMock) {
      await supabase.from('admin_activities').insert({
        id: deleteTarget.id,
        title: deleteTarget.title,
        description: deleteTarget.description,
        duration: deleteTarget.duration,
        type: deleteTarget.type,
        milestone_id: deleteTarget.milestone_id,
        prompts: deleteTarget.prompts,
        is_active: false,
      });
    } else {
      const { error } = await supabase.from('admin_activities').delete().eq('id', deleteTarget.id);
      if (error) { toast.error('Failed to delete'); return; }
    }
    await logAdminAction('delete', 'activity', deleteTarget.id, deleteTarget.title);
    toast.success('Activity deleted');
    setDeleteTarget(null);
    fetchData();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); fetchData(); };

  if (showForm || editing) {
    return <AdminActivityForm activity={editing} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={() => setShowForm(true)} className="w-full rounded-2xl gap-2">
        <Plus className="w-4 h-4" /> Add Activity
      </Button>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : allActivities.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No activities yet.</p>
      ) : (
        allActivities.map((item) => (
          <Card key={item.id} className={`rounded-2xl ${!item.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    {item.isMock && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        <Database className="w-2.5 h-2.5 mr-0.5" />mock
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.type} • {item.duration} • {item.milestone_id}</p>
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
        itemName={deleteTarget?.title ?? ''}
        itemType="activity"
      />
    </div>
  );
}
