import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AdminDeleteDialog } from './AdminDeleteDialog';

interface Promo {
  id: string; code: string; name: string; description: string;
  type: string; reward_id: string | null;
  valid_from: string | null; valid_until: string | null;
  max_uses: number | null; uses: number; is_active: boolean;
}

const TYPES = ['demo', 'reward_unlock', 'discount'];
const toLocal = (iso?: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
const fromLocal = (v: string) => v ? new Date(v).toISOString() : null;

export function AdminPromoCodesTab() {
  const [items, setItems] = useState<Promo[]>([]);
  const [rewards, setRewards] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('reward_unlock');
  const [rewardId, setRewardId] = useState<string>('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const fetchData = async () => {
    const [pRes, rRes] = await Promise.all([
      supabase.rpc('admin_list_promo_codes' as any),
      supabase.from('admin_rewards').select('id, name').eq('is_active', true),
    ]);
    if (pRes.data) setItems(pRes.data as Promo[]);
    if (rRes.data) setRewards(rRes.data);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const startCreate = () => {
    setCode(''); setName(''); setDescription(''); setType('reward_unlock');
    setRewardId(''); setValidFrom(''); setValidUntil(''); setMaxUses('');
    setEditing(null); setCreating(true);
  };
  const startEdit = (p: Promo) => {
    setCode(p.code); setName(p.name); setDescription(p.description); setType(p.type);
    setRewardId(p.reward_id ?? ''); setValidFrom(toLocal(p.valid_from)); setValidUntil(toLocal(p.valid_until));
    setMaxUses(p.max_uses != null ? String(p.max_uses) : '');
    setEditing(p); setCreating(false);
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!code.trim() || !name.trim()) { toast.error('Code and name required'); return; }
    const payload = {
      code: code.trim().toUpperCase(), name: name.trim(), description: description.trim(),
      type, reward_id: rewardId || null,
      valid_from: fromLocal(validFrom), valid_until: fromLocal(validUntil),
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
    };
    if (editing) {
      const { error } = await supabase.from('promo_codes').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('promo_codes').insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Saved'); cancel(); fetchData();
  };

  const toggleActive = async (p: Promo) => {
    const { error } = await supabase.from('promo_codes').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); setDeleteTarget(null); fetchData();
  };

  if (creating || editing) {
    return (
      <div className="space-y-4 pb-24">
        <h2 className="text-lg font-semibold font-serif">{editing ? 'Edit Promo Code' : 'New Promo Code'}</h2>
        <div className="space-y-3">
          <div><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="rounded-xl mt-1 font-mono uppercase" /></div>
          <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl mt-1" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Max Uses</Label><Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="unlimited" className="rounded-xl mt-1" /></div>
          </div>
          {type === 'reward_unlock' && (
            <div>
              <Label>Linked Reward</Label>
              <Select value={rewardId} onValueChange={setRewardId}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Select reward…" /></SelectTrigger>
                <SelectContent>{rewards.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Valid From</Label><Input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Valid Until</Label><Input type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="rounded-xl mt-1" /></div>
          </div>
        </div>
        <div className="flex gap-3"><Button variant="outline" onClick={cancel} className="flex-1 rounded-2xl">Cancel</Button><Button onClick={save} className="flex-1 rounded-2xl">Save</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Button onClick={startCreate} className="w-full rounded-2xl gap-2"><Plus className="w-4 h-4" /> Add Promo Code</Button>
      {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
        items.length === 0 ? <p className="text-center text-muted-foreground py-8">No promo codes yet.</p> :
        items.map(p => (
          <Card key={p.id} className={`rounded-2xl ${!p.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center"><Ticket className="w-5 h-5 text-gold" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><h3 className="font-semibold truncate">{p.name}</h3><span className="text-[10px] font-mono text-muted-foreground">{p.code}</span></div>
                  <p className="text-xs text-muted-foreground truncate">{p.type} • {p.uses}{p.max_uses ? `/${p.max_uses}` : ''} used</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg hover:bg-secondary">{p.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}</button>
                <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      <AdminDeleteDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} onConfirm={confirmDelete} itemName={deleteTarget?.name ?? ''} itemType="promo code" />
    </div>
  );
}
