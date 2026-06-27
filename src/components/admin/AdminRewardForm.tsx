import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { iconMap } from '@/lib/milestoneIcons';
import { logAdminAction } from '@/lib/adminLogger';

interface AdminRewardFormProps {
  reward?: {
    id: string;
    name: string;
    description: string;
    icon_id: string;
    type: string;
    partner_name: string | null;
    unlock_criteria: string | null;
    code?: string | null;
    valid_from?: string | null;
    valid_until?: string | null;
    duration_minutes?: number | null;
    redemption_window_hours?: number | null;
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const REWARD_TYPES = ['perk', 'experience', 'partner_reward'];
const ICON_IDS = Object.keys(iconMap);

const toLocalInput = (iso?: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 16) : '';
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

export function AdminRewardForm({ reward, onSave, onCancel }: AdminRewardFormProps) {
  const [name, setName] = useState(reward?.name ?? '');
  const [description, setDescription] = useState(reward?.description ?? '');
  const [iconId, setIconId] = useState(reward?.icon_id ?? 'gift');
  const [type, setType] = useState(reward?.type ?? 'perk');
  const [partnerName, setPartnerName] = useState(reward?.partner_name ?? '');
  const [unlockCriteria, setUnlockCriteria] = useState(reward?.unlock_criteria ?? '');
  const [code, setCode] = useState(reward?.code ?? '');
  const [validFrom, setValidFrom] = useState(toLocalInput(reward?.valid_from));
  const [validUntil, setValidUntil] = useState(toLocalInput(reward?.valid_until));
  const [durationMinutes, setDurationMinutes] = useState<string>(
    reward?.duration_minutes != null ? String(reward.duration_minutes) : ''
  );
  const [windowHours, setWindowHours] = useState<string>(
    reward?.redemption_window_hours != null ? String(reward.redemption_window_hours) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon_id: iconId,
      type,
      partner_name: partnerName.trim() || null,
      unlock_criteria: unlockCriteria.trim() || null,
      code: code.trim() ? code.trim().toUpperCase() : null,
      valid_from: fromLocalInput(validFrom),
      valid_until: fromLocalInput(validUntil),
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      redemption_window_hours: windowHours ? parseInt(windowHours, 10) : null,
    };

    if (reward) {
      const { error } = await supabase.from('admin_rewards').update(payload).eq('id', reward.id);
      if (error) { toast.error(error.message || 'Failed to update'); setSaving(false); return; }
      await logAdminAction('update', 'reward', reward.id, name.trim());
      toast.success('Reward updated');
    } else {
      const { data: inserted, error } = await supabase.from('admin_rewards').insert(payload).select('id').single();
      if (error) { toast.error(error.message || 'Failed to create'); setSaving(false); return; }
      await logAdminAction('create', 'reward', inserted?.id ?? '', name.trim());
      toast.success('Reward created');
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-lg font-semibold font-serif">{reward ? 'Edit Reward' : 'New Reward'}</h2>

      <div className="space-y-3">
        <div>
          <Label>Reward Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Connection Pioneer" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the reward..." className="rounded-xl mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Icon</Label>
            <Select value={iconId} onValueChange={setIconId}>
              <SelectTrigger className="rounded-xl mt-1">
                <div className="flex items-center gap-2">
                  {(() => { const Icon = iconMap[iconId]; return Icon ? <Icon className="w-4 h-4" /> : null; })()}
                  <span className="truncate">{iconId}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {ICON_IDS.map(id => {
                  const Icon = iconMap[id];
                  return (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{id}</span></div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REWARD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Partner Name (for perks)</Label>
          <Input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="La Maison" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Unlock Criteria</Label>
          <Textarea value={unlockCriteria} onChange={e => setUnlockCriteria(e.target.value)} placeholder="e.g. Complete 5 milestone activities" className="rounded-xl mt-1" />
        </div>

        {/* Time-limited fields */}
        <div className="rounded-2xl border border-border/60 p-3 space-y-3 bg-secondary/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Promotional / time limits</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Valid From</Label>
              <Input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs">Valid Until</Label>
              <Input type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Use Duration (min)</Label>
              <Input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="e.g. 90" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs">Redemption Window (hrs)</Label>
              <Input type="number" min="1" value={windowHours} onChange={e => setWindowHours(e.target.value)} placeholder="e.g. 24" className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Code (optional)</Label>
            <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="OPTIONAL-CODE" className="rounded-xl mt-1 font-mono uppercase" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 rounded-2xl">Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-2xl">
          {saving ? 'Saving...' : reward ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
