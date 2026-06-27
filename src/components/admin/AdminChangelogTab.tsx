import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, Activity, Gift, Trash2, Plus, Edit2, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface ChangelogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  details: Record<string, unknown>;
  created_at: string;
}

const ACTION_ICONS: Record<string, typeof Plus> = {
  create: Plus,
  update: Edit2,
  delete: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/10 text-green-600',
  update: 'bg-blue-500/10 text-blue-600',
  delete: 'bg-destructive/10 text-destructive',
};

const ENTITY_ICONS: Record<string, typeof Calendar> = {
  event: Calendar,
  activity: Activity,
  reward: Gift,
};

type SortField = 'date' | 'name';
type SortDir = 'asc' | 'desc';

export function AdminChangelogTab() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('admin_changelog')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setEntries(data as ChangelogEntry[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let result = entries;
    if (filterEntity !== 'all') result = result.filter(e => e.entity_type === filterEntity);
    if (filterAction !== 'all') result = result.filter(e => e.action_type === filterAction);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.entity_name.toLowerCase().includes(q) ||
        e.action_type.toLowerCase().includes(q) ||
        e.entity_type.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'date') {
        return sortDir === 'desc'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === 'desc'
        ? b.entity_name.localeCompare(a.entity_name)
        : a.entity_name.localeCompare(b.entity_name);
    });
    return result;
  }, [entries, filterEntity, filterAction, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4 pb-24">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search changelog..."
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="rounded-xl flex-1 text-xs h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
            <SelectItem value="reward">Rewards</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="rounded-xl flex-1 text-xs h-9"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Creates</SelectItem>
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="delete">Deletes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => toggleSort('date')}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${sortField === 'date' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
        >
          <ArrowUpDown className="w-3 h-3" /> Date {sortField === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('name')}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${sortField === 'name' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
        >
          <ArrowUpDown className="w-3 h-3" /> Name {sortField === 'name' && (sortDir === 'desc' ? 'Z-A' : 'A-Z')}
        </button>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No changelog entries found.</p>
      ) : (
        filtered.map(entry => {
          const ActionIcon = ACTION_ICONS[entry.action_type] || Edit2;
          const EntityIcon = ENTITY_ICONS[entry.entity_type] || Calendar;
          return (
            <Card key={entry.id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${ACTION_COLORS[entry.action_type] || 'bg-secondary text-muted-foreground'}`}>
                    <ActionIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{entry.entity_name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        <EntityIcon className="w-2.5 h-2.5 mr-0.5" />{entry.entity_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.action_type === 'create' && 'Created'}
                      {entry.action_type === 'update' && 'Updated'}
                      {entry.action_type === 'delete' && 'Deleted'}
                      {' • '}{format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {JSON.stringify(entry.details)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
