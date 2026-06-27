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

interface Stamp {
  id: string;
  milestone_key: string;
  name: string;
  description: string;
  icon_id: string;
  is_active: boolean;
  criteria_type: string;
  criteria_count: number;
  unlock_criteria: string;
  sort_order: number;
}

const ICON_IDS = Object.keys(iconMap);
const CRITERIA_TYPES = [
  { value: 'manual', label: 'Manual (admin only)' },
  { value: 'event_checkin', label: 'Event check-ins (in milestone)' },
  { value: 'activity_completion', label: 'Activities completed (in milestone)' },
  { value: 'milestone_progress', label: 'Any progress (events + activities)' },
];

export function AdminStampsTab() {
  const [items, setItems] = useState<Stamp[]>([]);
  const [milestones, setMilestones] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Stamp | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Stamp | null>(null);

  const [milestoneKey, setMilestoneKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconId, setIconId] = useState('star');
  const [criteriaType, setCriteriaType] = useState('manual');
  const [criteriaCount, setCriteriaCount] = useState('1');
  const [unlockCriteria, setUnlockCriteria] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const fetchData = async () => {
    const [stamps, ms] = await Promise.all([
      supabase.from('admin_stamps').select('*').order('milestone_key').order('sort_order'),
      supabase.from('admin_milestones').select('key, name').order('sort_order'),
    ]);
    if (stamps.data) setItems(stamps.data as Stamp[]);
    setMilestones((ms.data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const startCreate = () => {
    setMilestoneKey(milestones[0]?.key ?? '');
    setName(''); setDescription(''); setIconId('star');
    setCriteriaType('manual'); setCriteriaCount('1'); setUnlockCriteria(''); setSortOrder('0');
    setEditing(null); setCreating(true);
  };
  const startEdit = (s: Stamp) => {
    setMilestoneKey(s.milestone_key); setName(s.name); setDescription(s.description); setIconId(s.icon_id);
    setCriteriaType(s.criteria_type ?? 'manual');
    setCriteriaCount(String(s.criteria_count ?? 1));
    setUnlockCriteria(s.unlock_criteria ?? '');
    setSortOrder(String(s.sort_order ?? 0));
    setEditing(s); setCreating(false);
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!milestoneKey || !name.trim() || !unlockCriteria.trim()) {
      toast.error('Milestone, name, and unlock criteria are required'); return;
    }
    const payload = {
      milestone_key: milestoneKey,
      name: name.trim(),
      description: description.trim(),
      icon_id: iconId,
      criteria_type: criteriaType,
      criteria_count: parseInt(criteriaCount, 10) || 1,
      unlock_criteria: unlockCriteria.trim(),
      sort_order: parseInt(sortOrder, 10) || 0,
    };
    if (editing) {
      const { error } = await supabase.from('admin_stamps').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('admin_stamps').insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Saved'); cancel(); fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('admin_stamps').delete().eq('id', deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); setDeleteTarget(null); fetchData();
  };

  if (creating || editing) {
    return (
      <div className="space-y-4 pb-24">
        <h2 className="text-lg font-semibold font-serif">{editing ? 'Edit Stamp' : 'New Stamp'}</h2>
        <div className="space-y-3">
          <div>
            <Label>Milestone</Label>
            <Select value={milestoneKey} onValueChange={setMilestoneKey}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {milestones.map(m => <SelectItem key={m.key} value={m.key}>{m.name} ({m.key})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl mt-1" /></div>
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
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 p-3 space-y-3 bg-secondary/20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Auto-award rule</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Criteria Type</Label>
                <Select value={criteriaType} onValueChange={setCriteriaType}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CRITERIA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Threshold</Label>
                <Input
                  type="number" min="1"
                  value={criteriaCount}
                  onChange={e => setCriteriaCount(e.target.value)}
                  disabled={criteriaType === 'manual'}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Unlock Criteria (shown to user) *</Label>
              <Textarea
                value={unlockCriteria}
                onChange={e => setUnlockCriteria(e.target.value)}
                placeholder="e.g. Check in to 1 Sync Up event"
                className="rounded-xl mt-1"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3"><Button variant="outline" onClick={cancel} className="flex-1 rounded-2xl">Cancel</Button><Button onClick={save} className="flex-1 rounded-2xl">Save</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={startCreate} className="w-full rounded-2xl gap-2"><Plus className="w-4 h-4" /> Add Stamp</Button>
      {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
        items.length === 0 ? <p className="text-center text-muted-foreground py-8">No stamps yet.</p> :
        items.map(s => {
          const Icon = iconMap[s.icon_id] ?? Star;
          return (
            <Card key={s.id} className="rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl gradient-stamp flex items-center justify-center"><Icon className="w-5 h-5 text-primary-foreground" /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{s.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{s.milestone_key} • {s.criteria_type}{s.criteria_type !== 'manual' ? ` ≥${s.criteria_count}` : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      <AdminDeleteDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} onConfirm={confirmDelete} itemName={deleteTarget?.name ?? ''} itemType="stamp" />
    </div>
  );
}
