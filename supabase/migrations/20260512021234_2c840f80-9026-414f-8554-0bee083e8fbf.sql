-- Trigger: auto-create notification when a partner request is sent
DROP TRIGGER IF EXISTS trg_partner_request_notify ON public.partner_link_requests;
CREATE TRIGGER trg_partner_request_notify
AFTER INSERT ON public.partner_link_requests
FOR EACH ROW EXECUTE FUNCTION public.create_partner_request_notification();

-- Trigger: auto-set HEX qr code on event insert
DROP TRIGGER IF EXISTS trg_set_event_qr_code ON public.admin_events;
CREATE TRIGGER trg_set_event_qr_code
BEFORE INSERT ON public.admin_events
FOR EACH ROW EXECUTE FUNCTION public.set_event_qr_code();

-- Backfill missing qr codes on existing events
UPDATE public.admin_events
SET qr_short_code = public.gen_hex_qr_code()
WHERE qr_short_code IS NULL;

-- Enable realtime on notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;