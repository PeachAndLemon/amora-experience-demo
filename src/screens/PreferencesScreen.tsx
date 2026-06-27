import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAmora } from '@/contexts/AmoraContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, addMonths, differenceInDays } from 'date-fns';

interface SurveyHistoryEntry {
  id: string;
  survey_number: number;
  relationship_season: string | null;
  relationship_duration: string | null;
  autopilot_level: number;
  rich_in: string | null;
  want_more_of: string[];
  gets_in_way: string[];
  love_as_place: string;
  destination_feeling: string | null;
  amora_wish: string;
  taken_at: string;
  partner_id: string | null;
}

interface PreferencesScreenProps {
  onBack: () => void;
  onRetakeSurvey?: () => void;
}

const SURVEY_MILESTONES = [3, 6, 12, 18, 24]; // months

const LABEL_MAP: Record<string, string> = {
  'building': 'Building — laying your foundation',
  'committed': 'Committed — growing as a team',
  'established': 'Established — keeping the spark alive',
  '0-2': '0–2 years',
  '2-5': '2–5 years',
  '5-10': '5–10 years',
  '10+': '10+ years',
  'trust-reliability': 'Trust & Reliability',
  'life-logistics': 'Life Logistics',
  'ideas-ambition': 'Ideas & Ambition',
  'comfort-familiarity': 'Comfort & Familiarity',
  'play-laughter': 'Play & Laughter',
  'creating-together': 'Creating Together',
  'presence-deep-talks': 'Presence & Deep Talks',
  'romance-desire': 'Romance & Desire',
  'adventure-challenge': 'Adventure & Challenge',
  'mental-overload': 'Mental Overload',
  'screens-distraction': 'Screens & Distraction',
  'same-routine': 'Same Old Routine',
  'side-by-side': 'Side by Side (not face to face)',
  'attunement': 'Feeling in Sync',
  'vitality': 'Spark & Energy',
  'safe-haven': 'Peace & Comfort',
  'co-adventure': 'Building Something Big',
};

function getLabel(key: string | null): string {
  if (!key) return '—';
  return LABEL_MAP[key] || key;
}

export function PreferencesScreen({ onBack, onRetakeSurvey }: PreferencesScreenProps) {
  const { deepOnboardingAnswers } = useAmora();
  const { user } = useAuth();
  const [history, setHistory] = useState<SurveyHistoryEntry[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [profileDate, setProfileDate] = useState<Date | null>(null);
  const [nextDue, setNextDue] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [historyRes, profileRes] = await Promise.all([
        supabase.from('onboarding_survey_history').select('*').eq('user_id', user.id).order('taken_at', { ascending: false }),
        supabase.from('profiles').select('created_at, next_survey_due').eq('user_id', user.id).single(),
      ]);
      if (historyRes.data) setHistory(historyRes.data as SurveyHistoryEntry[]);
      if (profileRes.data) {
        const created = new Date(profileRes.data.created_at);
        setProfileDate(created);
        if (profileRes.data.next_survey_due) {
          setNextDue(new Date(profileRes.data.next_survey_due));
        } else {
          // Calculate next due based on creation date
          const now = new Date();
          for (const months of SURVEY_MILESTONES) {
            const due = addMonths(created, months);
            if (due > now) { setNextDue(due); break; }
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const daysUntilDue = nextDue ? differenceInDays(nextDue, new Date()) : null;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 14;

  const answers = deepOnboardingAnswers;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-wine px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground font-serif">Preferences</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm">Your relationship goals & onboarding answers</p>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {/* Retake prompt */}
        {isDueSoon && (
          <Card className="rounded-2xl border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Time for a check-in!</p>
                <p className="text-xs text-muted-foreground">
                  {daysUntilDue! <= 0 ? 'Your survey is due now' : `Due in ${daysUntilDue} days`}
                </p>
              </div>
              {onRetakeSurvey && (
                <Button size="sm" onClick={onRetakeSurvey} className="rounded-xl text-xs">
                  Retake
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current answers */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-serif font-semibold text-foreground">Current Answers</h2>
            <AnswerRow label="Season" value={getLabel(answers.relationshipSeason)} />
            <AnswerRow label="Duration" value={getLabel(answers.relationshipDuration)} />
            <AnswerRow label="Autopilot Level" value={`${answers.autopilotLevel}/10`} />
            <AnswerRow label="Rich In" value={getLabel(answers.richIn)} />
            <AnswerRow label="Want More Of" value={answers.wantMoreOf.map(getLabel).join(', ') || '—'} />
            <AnswerRow label="Gets In Way" value={(answers.getsInWay as string[]).map(getLabel).join(', ') || '—'} />
            <AnswerRow label="Love As Place" value={answers.loveAsPlace || '—'} />
            <AnswerRow label="Destination" value={getLabel(answers.destinationFeeling)} />
            <AnswerRow label="Amora Wish" value={answers.amoraWish || '—'} />
          </CardContent>
        </Card>

        {/* Next survey due */}
        {nextDue && !isDueSoon && (
          <Card className="rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Next check-in</p>
                <p className="text-xs text-muted-foreground">{format(nextDue, 'MMMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Survey history */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif font-semibold text-foreground px-1">Survey History</h2>
            {history.map(entry => (
              <Card key={entry.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">
                        Survey #{entry.survey_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.taken_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {expandedHistory === entry.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedHistory === entry.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <AnswerRow label="Season" value={getLabel(entry.relationship_season)} />
                      <AnswerRow label="Duration" value={getLabel(entry.relationship_duration)} />
                      <AnswerRow label="Autopilot" value={`${entry.autopilot_level}/10`} />
                      <AnswerRow label="Rich In" value={getLabel(entry.rich_in)} />
                      <AnswerRow label="Want More Of" value={entry.want_more_of?.map(getLabel).join(', ') || '—'} />
                      <AnswerRow label="Gets In Way" value={entry.gets_in_way?.map(getLabel).join(', ') || '—'} />
                      <AnswerRow label="Love As Place" value={entry.love_as_place || '—'} />
                      <AnswerRow label="Destination" value={getLabel(entry.destination_feeling)} />
                      <AnswerRow label="Wish" value={entry.amora_wish || '—'} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Manual retake */}
        {onRetakeSurvey && !isDueSoon && (
          <Button variant="outline" onClick={onRetakeSurvey} className="w-full rounded-2xl gap-2">
            <RefreshCw className="w-4 h-4" /> Retake Survey
          </Button>
        )}
      </div>
    </div>
  );
}

function AnswerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right">{value}</span>
    </div>
  );
}
