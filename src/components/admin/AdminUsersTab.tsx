import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Search } from 'lucide-react';
import { toast } from 'sonner';

interface UserRow {
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  couple_name: string | null;
  partner_connected: boolean | null;
  created_at: string;
  is_admin: boolean;
  activity_count: number;
  event_checkin_count: number;
  reward_redemption_count: number;
  engagement_count: number;
}

export function AdminUsersTab() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_user_overview' as any);
    if (error) { toast.error(error.message); }
    else if (data) setRows(data as UserRow[]);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const toggleAdmin = async (u: UserRow) => {
    const { error } = await supabase.rpc('admin_set_user_role' as any, {
      target_user_id: u.user_id, target_role: 'admin', grant_role: !u.is_admin,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(u.is_admin ? 'Admin removed' : 'Admin granted');
    fetchData();
  };

  const exportCsv = () => {
    const headers = ['user_id','name','partner_connected','admin','activities','checkins','rewards','engagement','created_at'];
    const lines = rows.map(r => [
      r.user_id,
      (r.couple_name || r.partner1_name || '').replace(/,/g, ' '),
      r.partner_connected, r.is_admin,
      r.activity_count, r.event_checkin_count, r.reward_redemption_count, r.engagement_count,
      r.created_at,
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `amora-users-${new Date().toISOString().slice(0,10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  const visible = rows.filter(r => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (r.partner1_name?.toLowerCase().includes(q)
         || r.couple_name?.toLowerCase().includes(q)
         || r.user_id.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by name or ID" className="rounded-xl pl-9" />
        </div>
        <Button variant="outline" className="rounded-xl" onClick={exportCsv}>Export CSV</Button>
      </div>

      {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
        visible.length === 0 ? <p className="text-center text-muted-foreground py-8">No users found.</p> :
        visible.map(u => (
          <Card key={u.user_id} className="rounded-2xl">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{u.couple_name || u.partner1_name || 'Anonymous'}</h3>
                    {u.is_admin && <Badge className="text-[10px]">Admin</Badge>}
                    {u.partner_connected && <Badge variant="outline" className="text-[10px]">Linked</Badge>}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">{u.user_id}</p>
                </div>
                <Button size="sm" variant={u.is_admin ? 'destructive' : 'outline'} className="rounded-xl gap-1.5 shrink-0" onClick={() => toggleAdmin(u)}>
                  {u.is_admin ? <><ShieldOff className="w-3.5 h-3.5" /> Demote</> : <><Shield className="w-3.5 h-3.5" /> Promote</>}
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-secondary/40 rounded-lg p-2"><p className="text-base font-bold">{u.activity_count}</p><p className="text-[10px] text-muted-foreground">Activities</p></div>
                <div className="bg-secondary/40 rounded-lg p-2"><p className="text-base font-bold">{u.event_checkin_count}</p><p className="text-[10px] text-muted-foreground">Check-ins</p></div>
                <div className="bg-secondary/40 rounded-lg p-2"><p className="text-base font-bold">{u.reward_redemption_count}</p><p className="text-[10px] text-muted-foreground">Rewards</p></div>
                <div className="bg-secondary/40 rounded-lg p-2"><p className="text-base font-bold">{u.engagement_count}</p><p className="text-[10px] text-muted-foreground">Events</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
