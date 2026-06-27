import { useEffect, useState }  from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  data: any;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setItems(data as NotificationRow[]);
  };

  useEffect(() => {
    if (!user) return;
    fetchItems();
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unread = items.filter(i => !i.read_at).length;

  const markAllRead = async () => {
    if (!user) return;
    const unreadCount = items.filter(i => !i.read_at).length;
    if (unreadCount === 0) return;
    const now = new Date().toISOString();
    // Optimistic UI – badge clears immediately
    setItems(prev => prev.map(i => i.read_at ? i : { ...i, read_at: now }));
    const { error } = await supabase.from('notifications').update({ read_at: now })
      .eq('user_id', user.id).is('read_at', null);
    if (error) {
      toast.error('Could not mark notifications as read');
      return;
    }
    toast.success(`Marked ${unreadCount} notification${unreadCount === 1 ? '' : 's'} as read`);
    // Analytics
    await supabase.from('user_engagement').insert({
      user_id: user.id,
      engagement_type: 'mark_all_read',
      entity_type: 'notification',
      entity_id: 'bulk',
      entity_name: 'Notification Bell',
      metadata: { count: unreadCount },
    } as any);
  };

  const markOneRead = async (id: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    setItems(prev => prev.map(i => i.id === id ? { ...i, read_at: now } : i));
    await supabase.from('notifications').update({ read_at: now })
      .eq('id', id).eq('user_id', user.id).is('read_at', null);
  };

  const dismissNotification = async (id: string) => {
    if (!user) return;
    setItems(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from('notifications').delete()
      .eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error('Could not dismiss notification');
      fetchItems();
    }
  };

  const handleClick = (n: NotificationRow) => {
    if (!n.read_at) markOneRead(n.id);
    // Deep link routing
    if (n.type === 'new_event' && n.data?.event_id) {
      window.dispatchEvent(new CustomEvent('amora:open-event', { detail: { eventId: n.data.event_id } }));
      setOpen(false);
    } else if (n.type === 'partner_request') {
      window.dispatchEvent(new CustomEvent('amora:open-partner-request'));
      setOpen(false);
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4 text-foreground" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="font-serif font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={markAllRead}>
              <CheckCheck className="w-3 h-3" /> Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">No notifications yet</p>
          ) : items.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read_at ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <div className="flex items-center gap-2 shrink-1">
                  {!n.read_at && <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-1" aria-label="Unread" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                    className="rounded-full hover:bg-accent p-1 transition-colors"
                    aria-label="Dismiss notification"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
