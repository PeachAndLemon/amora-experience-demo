import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { milestones } from '@/data/mockData';
import { iconMap } from '@/lib/milestoneIcons';
import { Upload, X } from 'lucide-react';
import { logAdminAction } from '@/lib/adminLogger';
import { EventQRCode } from './EventQRCode';

interface AdminEventFormProps {
  event?: {
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
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const STAMP_ICONS = Object.keys(iconMap);

export function AdminEventForm({ event, onSave, onCancel }: AdminEventFormProps) {
  const [name, setName] = useState(event?.name ?? '');
  const [venue, setVenue] = useState(event?.venue ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [milestoneId, setMilestoneId] = useState(event?.milestone_id ?? milestones[0].id);
  const [stampIconId, setStampIconId] = useState(event?.stamp_icon_id ?? 'star');
  const [stampName, setStampName] = useState(event?.stamp_name ?? '');
  const [eventDate, setEventDate] = useState(event?.event_date ? event.event_date.split('T')[0] : '');
  const [imageUrl, setImageUrl] = useState(event?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedMilestone = milestones.find(m => m.id === milestoneId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName);

    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success('Image uploaded');
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);

    const payload = {
      name: name.trim(),
      venue: venue.trim(),
      location: location.trim(),
      description: description.trim(),
      milestone_id: milestoneId,
      milestone_category: selectedMilestone?.name ?? '',
      stamp_icon_id: stampIconId,
      stamp_name: stampName.trim(),
      event_date: eventDate || new Date().toISOString(),
      image_url: imageUrl || null,
    };

    if (event) {
      const { error } = await supabase.from('admin_events').update(payload).eq('id', event.id);
      if (error) { toast.error('Failed to update event'); setSaving(false); return; }
      await logAdminAction('update', 'event', event.id, name.trim());
      toast.success('Event updated');
    } else {
      const { data: inserted, error } = await supabase.from('admin_events').insert(payload).select('id').single();
      if (error) { toast.error('Failed to create event'); setSaving(false); return; }
      await logAdminAction('create', 'event', inserted?.id ?? '', name.trim());
      toast.success('Event created');
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-lg font-semibold font-serif">{event ? 'Edit Event' : 'New Event'}</h2>

      <div className="space-y-3">
        <div>
          <Label>Event Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sunset Wine Tasting" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Venue</Label>
          <Input value={venue} onChange={e => setVenue(e.target.value)} placeholder="La Maison Vineyard" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Napa Valley" className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the event..." className="rounded-xl mt-1" />
        </div>

        {/* Event Image */}
        <div>
          <Label>Event Image</Label>
          {imageUrl ? (
            <div className="relative mt-1 rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Event" className="w-full h-40 object-cover rounded-xl" />
              <button
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 mt-1 h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploading ? (
                <span className="text-sm text-muted-foreground">Uploading...</span>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload image</span>
                </>
              )}
            </label>
          )}
        </div>

        <div>
          <Label>Milestone</Label>
          <Select value={milestoneId} onValueChange={setMilestoneId}>
            <SelectTrigger className="rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {milestones.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Stamp Icon</Label>
            <Select value={stampIconId} onValueChange={setStampIconId}>
              <SelectTrigger className="rounded-xl mt-1">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = iconMap[stampIconId];
                    return Icon ? <Icon className="w-4 h-4" /> : null;
                  })()}
                  <span className="truncate">{stampIconId}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STAMP_ICONS.map(iconId => {
                  const Icon = iconMap[iconId];
                  return (
                    <SelectItem key={iconId} value={iconId}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{iconId}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stamp Name</Label>
            <Input value={stampName} onChange={e => setStampName(e.target.value)} placeholder="Wine & Dine" className="rounded-xl mt-1" />
          </div>
        </div>
        <div>
          <Label>Event Date</Label>
          <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-xl mt-1" />
        </div>

        {/* QR Code - shown when editing existing event */}
        {event && (
          <EventQRCode eventId={event.id} eventName={event.name} />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 rounded-2xl">Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-2xl">
          {saving ? 'Saving...' : event ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
