import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { milestones } from '@/data/mockData';
import { logAdminAction } from '@/lib/adminLogger';

interface AdminActivityFormProps {
  activity?: {
    id: string;
    title: string;
    description: string;
    duration: string;
    type: string;
    milestone_id: string;
    prompts: string[] | null;
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = ['conversation', 'physical', 'creative', 'mindfulness'];

export function AdminActivityForm({ activity, onSave, onCancel }: AdminActivityFormProps) {
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [duration, setDuration] = useState(activity?.duration ?? '15 min');
  const [type, setType] = useState(activity?.type ?? 'conversation');
  const [milestoneId, setMilestoneId] = useState(activity?.milestone_id ?? milestones[0].id);
  const [promptsText, setPromptsText] = useState((activity?.prompts ?? []).join('\n'));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);

    const prompts = promptsText.split('\n').map(p => p.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim(),
      type,
      milestone_id: milestoneId,
      prompts,
    };

    if (activity) {
      const { error } = await supabase.from('admin_activities').update(payload).eq('id', activity.id);
      if (error) { toast.error('Failed to update'); setSaving(false); return; }
      await logAdminAction('update', 'activity', activity.id, title.trim());
      toast.success('Activity updated');
    } else {
      const { data: inserted, error } = await supabase.from('admin_activities').insert(payload).select('id').single();
      if (error) { toast.error('Failed to create'); setSaving(false); return; }
      await logAdminAction('create', 'activity', inserted?.id ?? '', title.trim());
      toast.success('Activity created');
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-lg font-semibold font-serif">{activity ? 'Edit Activity' : 'New Activity'}</h2>

      <div className="space-y-3">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Morning Ritual" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the activity..." className="rounded-xl mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Duration</Label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="15 min" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Milestone</Label>
          <Select value={milestoneId} onValueChange={setMilestoneId}>
            <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Prompts (one per line)</Label>
          <Textarea value={promptsText} onChange={e => setPromptsText(e.target.value)} placeholder="Enter prompts, one per line..." rows={4} className="rounded-xl mt-1" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 rounded-2xl">Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-2xl">
          {saving ? 'Saving...' : activity ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
