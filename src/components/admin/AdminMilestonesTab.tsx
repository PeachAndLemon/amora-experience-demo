import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { iconMap } from '@/lib/milestoneIcons';
import { AdminDeleteDialog } from './AdminDeleteDialog';

interface Milestone {
  id: string;
  key: string;
  name: string;
  description: string;
  icon_id: string;
  sort_order: number;
  is_active: boolean;
}

const ICON_IDS = Object.keys(iconMap);

export function AdminMilestonesTab() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);

  // Form state
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconId, setIconId] = useState('star');
  const [sortOrder, setSortOrder] = useState('0');

  const fetchData = async () => {
    const { data } = await supabase.from('admin_milestones').select('*').order('sort_order');
    if (data) setItems(data as Milestone[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startCreate = () => {
    setKey(''); setName(''); setDescription(''); setIconId('star'); setSortOrder(String(items.length));
    setEditing(null); setCreating(true);
  };
  const startEdit = (m: Milestone) => {
    setKey(m.key); setName(m.name); setDescription(m.description); setIconId(m.icon_id); setSortOrder(String(m.sort_order));
    setEditing(m); setCreating(false);
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!key.trim() || !name.trim()) { toast.error('Key and name required'); return; }
    const payload = {
      key: key.trim(), name: name.trim(), description: description.trim(),
      icon_id: iconId, sort_order: parseInt(sortOrder, 10) || 0,
    };
    if (editing) {
      const { error } = await supabase.from('admin_milestones').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Milestone updated');
    } else {
      const { error } = await supabase.from('admin_milestones').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Milestone created');
    }
    cancel(); fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('admin_milestones').delete().eq('id', deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); setDeleteTarget(null); fetchData();
  };

  if (creating || editing) {
    return (
      <div className="space-y-4 pb-24">
        <h2 className="text-lg font-semibold font-serif">{editing ? 'Edit Milestone' : 'New Milestone'}</h2>
        <div className="space-y-3">
          <div><Label>Key</Label><Input value={key} onChange={e => setKey(e.target.value)} placeholder="sync_up" className="rounded-xl mt-1" /></div>
          <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Sync Up" className="rounded-xl mt-1" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Icon</Label>
              <Select value={iconId} onValueChange={setIconId}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{ICON_IDS.map(id => {
                  const Icon = iconMap[id];
                  return <SelectItem key={id} value={id}><div className="flex items-center gap-2"><Icon className="w-4 h-4" />{id}</div></SelectItem>;
                })}</SelectContent>
              </Select>
            </div>
            <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="rounded-xl mt-1" /></div>
          </div>
        </div>
        <div className="flex gap-3"><Button variant="outline" onClick={cancel} className="flex-1 rounded-2xl">Cancel</Button><Button onClick={save} className="flex-1 rounded-2xl">Save</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={startCreate} className="w-full rounded-2xl gap-2"><Plus className="w-4 h-4" /> Add Milestone</Button>
      {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
        items.length === 0 ? <p className="text-center text-muted-foreground py-8">No milestones yet.</p> :
        items.map(m => {
          const Icon = iconMap[m.icon_id] ?? Star;
          return (
            <Card key={m.id} className={`rounded-2xl ${!m.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{m.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{m.key} • #{m.sort_order}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      <AdminDeleteDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} onConfirm={confirmDelete} itemName={deleteTarget?.name ?? ''} itemType="milestone" />
    </div>
  );
}
