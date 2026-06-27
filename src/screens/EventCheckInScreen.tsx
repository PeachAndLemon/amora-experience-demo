import { useState, useEffect } from 'react';
import { EventScanner } from '@/components/events/EventScanner';
import { StampRevealModal } from '@/components/events/StampRevealModal';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { AmoraEvent } from '@/types/amora';
import { mockEvents } from '@/data/eventData';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin, Calendar, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { MilestoneIcon } from '@/lib/milestoneIcons';
import { format } from 'date-fns';
import { toast } from 'sonner';

type CheckInState = 'idle' | 'scanning' | 'success' | 'error' | 'already-checked';

interface EventCheckInScreenProps {
  onClose: () => void;
  onViewPassport: () => void;
  focusedEventId?: string | null;
}

export function EventCheckInScreen({ onClose, onViewPassport, focusedEventId }: EventCheckInScreenProps) {
  const [state, setState] = useState<CheckInState>('idle');
  const [checkedEvent, setCheckedEvent] = useState<AmoraEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkedInEvents, setCheckedInEvents] = useState<Set<string>>(new Set());
  const [allEvents, setAllEvents] = useState<AmoraEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: dbEvents } = await supabase
        .from('admin_events')
        .select('*')
        .eq('is_active', true);

      const dbMapped: AmoraEvent[] = (dbEvents ?? []).map(e => ({
        id: e.id,
        name: e.name,
        venue: e.venue,
        location: e.location ?? undefined,
        description: e.description,
        milestoneId: e.milestone_id,
        milestoneCategory: e.milestone_category,
        stampIconId: e.stamp_icon_id,
        stampName: e.stamp_name,
        date: new Date(e.event_date),
        isActive: e.is_active,
      }));

      const dbIds = new Set(dbMapped.map(e => e.id));
      const merged = [
        ...dbMapped,
        ...mockEvents.filter(e => e.isActive && !dbIds.has(e.id)),
      ];
      setAllEvents(merged);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: checkins } = await supabase
          .from('event_checkins')
          .select('event_id')
          .eq('user_id', user.id);
        if (checkins) {
          setCheckedInEvents(new Set(checkins.map(c => c.event_id)));
        }
      }
    };
    load();
  }, []);

  const handleStartScan = () => setState('scanning');

  const handleScanSuccess = async (code: string) => {
    // Server-side validates HEX code, expiry, single-use, and inserts checkin + stamp atomically.
    const { data, error } = await supabase.rpc('validate_event_checkin' as any, {
      qr_code_input: code,
    });
    if (error) {
      setErrorMessage('Could not validate code. Please try again.');
      setState('error');
      return;
    }
    const result = data as { success: boolean; error?: string; event_id?: string; event_name?: string; milestone_id?: string; stamp_name?: string; stamp_icon_id?: string };
    if (!result?.success) {
      const msg = result?.error ?? 'Invalid code';
      setErrorMessage(msg);
      setState(msg.toLowerCase().includes('already') ? 'already-checked' : 'error');
      return;
    }

    const event = allEvents.find(e => e.id === result.event_id) ?? {
      id: result.event_id!,
      name: result.event_name ?? 'Event',
      venue: '',
      description: '',
      milestoneId: result.milestone_id ?? '',
      milestoneCategory: '',
      stampIconId: result.stamp_icon_id ?? 'star',
      stampName: result.stamp_name ?? '',
      date: new Date(),
      isActive: true,
    } as AmoraEvent;

    setCheckedEvent(event);
    setCheckedInEvents(prev => new Set([...prev, event.id]));
    setState('success');
    toast.success('Check-in successful!');
  };


  const handleCloseScanner = () => {
    setState('idle');
    setErrorMessage('');
  };

  const handleStampRevealClose = () => {
    setState('idle');
    setCheckedEvent(null);
  };

  const handleViewPassportFromReveal = () => {
    setState('idle');
    setCheckedEvent(null);
    onViewPassport();
  };

  if (state === 'success' && checkedEvent) {
    return (
      <StampRevealModal
        event={checkedEvent}
        onClose={handleStampRevealClose}
        onViewPassport={handleViewPassportFromReveal}
      />
    );
  }

  if (state === 'scanning') {
    return (
      <EventScanner
        isScanning={true}
        onScanSuccess={handleScanSuccess}
        onClose={handleCloseScanner}
      />
    );
  }

  if (state === 'error' || state === 'already-checked') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <Header title="Check-In" showPartnerStatus={false} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            {state === 'already-checked' ? 'Already Checked In' : 'Check-In Failed'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xs">{errorMessage}</p>
          <div className="space-y-3 w-full max-w-sm">
            <Button variant="sunset" size="lg" className="w-full" onClick={handleStartScan}>
              Try Again
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const focusedEvent = focusedEventId ? allEvents.find(e => e.id === focusedEventId) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={focusedEvent ? 'Event Details' : 'Event Check-In'} showPartnerStatus={false} />
      <main className="px-6 py-6 space-y-8">
        {/* Focused event detail (from notification deep link) */}
        {focusedEvent && (
          <article className="bg-card rounded-3xl overflow-hidden shadow-card">
            {(focusedEvent as any).imageUrl && (
              <img src={(focusedEvent as any).imageUrl} alt={focusedEvent.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl gradient-stamp shadow-stamp flex items-center justify-center shrink-0">
                  <MilestoneIcon iconId={focusedEvent.stampIconId} className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">{focusedEvent.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{focusedEvent.milestoneCategory}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{focusedEvent.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{focusedEvent.venue}{focusedEvent.location ? ` — ${focusedEvent.location}` : ''}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(focusedEvent.date, 'EEE, MMM d • h:mm a')}</span>
              </div>
              <Button variant="sunset" size="lg" className="w-full" onClick={handleStartScan}>
                Check In to This Event
              </Button>
            </div>
          </article>
        )}

        {/* Scan CTA */}
        {!focusedEvent && (
          <div className="bg-card rounded-3xl p-6 shadow-card text-center">
            <div className="w-24 h-24 rounded-full gradient-sunset mx-auto flex items-center justify-center mb-4 shadow-glow animate-glow">
              <QrCode className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Ready to Check In?
            </h2>
            <p className="text-muted-foreground mb-6">
              Scan the Amora QR code at your event to collect your stamp
            </p>
            <Button variant="sunset" size="xl" className="w-full" onClick={handleStartScan}>
              Scan Event Code
            </Button>
          </div>
        )}

        {/* Upcoming events */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {allEvents.filter(e => e.isActive).map(event => {
              const isCheckedIn = checkedInEvents.has(event.id);
              return (
                <div
                  key={event.id}
                  className={`bg-card rounded-2xl p-5 shadow-soft transition-all ${
                    isCheckedIn ? 'border-2 border-primary/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isCheckedIn ? 'gradient-stamp shadow-stamp' : 'bg-secondary'
                      }`}
                    >
                      <MilestoneIcon iconId={event.stampIconId} className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCheckedIn && (
                          <span className="text-xs font-medium text-primary bg-secondary px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Collected
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{event.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(event.date, 'MMM d')}
                        </span>
                      </div>
                    </div>
                    {!isCheckedIn && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-secondary/50 rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Attend an Amora partner event
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Find the Amora QR code at the venue
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
              Scan together to collect your stamp!
            </li>
          </ol>
        </section>
      </main>

      <div className="fixed bottom-24 left-0 right-0 px-6 safe-bottom">
        <Button variant="soft" size="lg" className="w-full" onClick={onClose}>
          Back to Journey
        </Button>
      </div>
    </div>
  );
}
