import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Database, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminEventForm } from './AdminEventForm';
import { AdminDeleteDialog } from './AdminDeleteDialog';
import { mockEvents } from '@/data/eventData';
import { logAdminAction } from '@/lib/adminLogger';


interface AdminEvent {
  id: string;
  name: string;
  venue: string;
  location: string | null;
  description: string;
  milestone_id: string;
  milestone_category: string;
  stamp_icon_id: string;
  stamp_name: string;
  event_date: string;
  is_active: boolean;
  image_url?: string | null;
  qr_short_code?: string | null;
  isMock?: boolean;
}

export function AdminEventsTab() {
  const [dbEvents, setDbEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('admin_events')
      .select('*')
      .order('event_date', { ascending: false });
    if (data) setDbEvents(data as AdminEvent[]);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  // Merge DB events with mock events
  const mockMapped: AdminEvent[] = mockEvents.map(e => ({
    id: e.id,
    name: e.name,
    venue: e.venue,
    location: e.location ?? null,
    description: e.description,
    milestone_id: e.milestoneId,
    milestone_category: e.milestoneCategory,
    stamp_icon_id: e.stampIconId,
    stamp_name: e.stampName,
    event_date: e.date.toISOString(),
    is_active: e.isActive,
    isMock: true,
  }));

  const allEvents = [
    ...dbEvents,
    ...mockMapped.filter(m => !dbEvents.some(d => d.id === m.id)),
  ];

  const toggleActive = async (event: AdminEvent) => {
    if (event.isMock) {
      // Save mock to DB first
      const { error } = await supabase.from('admin_events').insert({
        id: event.id,
        name: event.name,
        venue: event.venue,
        location: event.location,
        description: event.description,
        milestone_id: event.milestone_id,
        milestone_category: event.milestone_category,
        stamp_icon_id: event.stamp_icon_id,
        stamp_name: event.stamp_name,
        event_date: event.event_date,
        is_active: !event.is_active,
      });
      if (error) { toast.error('Failed to update'); return; }
    } else {
      const { error } = await supabase
        .from('admin_events')
        .update({ is_active: !event.is_active })
        .eq('id', event.id);
      if (error) { toast.error('Failed to update'); return; }
    }
    await logAdminAction('update', 'event', event.id, event.name, { field: 'is_active', newValue: !event.is_active });
    toast.success(event.is_active ? 'Event deactivated' : 'Event activated');
    fetchEvents();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isMock) {
      // Save as inactive to DB to "delete" mock
      await supabase.from('admin_events').insert({
        id: deleteTarget.id,
        name: deleteTarget.name,
        venue: deleteTarget.venue,
        location: deleteTarget.location,
        description: deleteTarget.description,
        milestone_id: deleteTarget.milestone_id,
        milestone_category: deleteTarget.milestone_category,
        stamp_icon_id: deleteTarget.stamp_icon_id,
        stamp_name: deleteTarget.stamp_name,
        event_date: deleteTarget.event_date,
        is_active: false,
      });
    } else {
      const { error } = await supabase.from('admin_events').delete().eq('id', deleteTarget.id);
      if (error) { toast.error('Failed to delete'); return; }
    }
    await logAdminAction('delete', 'event', deleteTarget.id, deleteTarget.name);
    toast.success('Event deleted');
    setDeleteTarget(null);
    fetchEvents();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleEdit = (event: AdminEvent) => {
    setEditingEvent(event);
  };

  if (showForm || editingEvent) {
    return (
      <AdminEventForm
        event={editingEvent}
        onSave={handleSaved}
        onCancel={() => { setShowForm(false); setEditingEvent(null); }}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={() => setShowForm(true)} className="w-full rounded-2xl gap-2">
        <Plus className="w-4 h-4" /> Add Event
      </Button>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : allEvents.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No events yet. Create your first one!</p>
      ) : (
        allEvents.map((event) => (
          <Card key={event.id} className={`rounded-2xl ${!event.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
                    {event.isMock && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                        <Database className="w-2.5 h-2.5 mr-0.5" />mock
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.venue} • {event.milestone_category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    {event.qr_short_code && (
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <QrCode className="w-2.5 h-2.5" />
                        AMORA-{event.qr_short_code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActive(event)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    {event.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => handleEdit(event)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteTarget(event)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
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
        itemType="event"
      />
    </div>
  );
}
