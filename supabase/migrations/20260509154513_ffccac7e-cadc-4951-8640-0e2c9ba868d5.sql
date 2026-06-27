
ALTER TABLE public.admin_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.admin_events ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.admin_events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.admin_rewards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.admin_rewards ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.admin_rewards ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.admin_activities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.admin_activities ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.admin_activities ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.admin_events ADD COLUMN IF NOT EXISTS qr_short_code text;
ALTER TABLE public.admin_events ADD COLUMN IF NOT EXISTS qr_expires_at timestamptz;

CREATE OR REPLACE FUNCTION public.gen_hex_qr_code() RETURNS text
LANGUAGE plpgsql VOLATILE SET search_path = public AS $$
DECLARE candidate text; cnt int;
BEGIN
  LOOP
    candidate := upper(encode(gen_random_bytes(4), 'hex'));
    SELECT count(*) INTO cnt FROM public.admin_events WHERE qr_short_code = candidate;
    EXIT WHEN cnt = 0;
  END LOOP;
  RETURN candidate;
END;
$$;

UPDATE public.admin_events SET qr_short_code = upper(encode(gen_random_bytes(4),'hex')) WHERE qr_short_code IS NULL;

CREATE OR REPLACE FUNCTION public.set_event_qr_code() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.qr_short_code IS NULL THEN
    NEW.qr_short_code := public.gen_hex_qr_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_event_qr_code ON public.admin_events;
CREATE TRIGGER trg_set_event_qr_code BEFORE INSERT ON public.admin_events
  FOR EACH ROW EXECUTE FUNCTION public.set_event_qr_code();

CREATE UNIQUE INDEX IF NOT EXISTS admin_events_qr_short_code_key ON public.admin_events(qr_short_code);

ALTER TABLE public.admin_rewards
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS valid_from timestamptz,
  ADD COLUMN IF NOT EXISTS valid_until timestamptz,
  ADD COLUMN IF NOT EXISTS duration_minutes int,
  ADD COLUMN IF NOT EXISTS redemption_window_hours int;

CREATE UNIQUE INDEX IF NOT EXISTS admin_rewards_code_key ON public.admin_rewards(lower(code)) WHERE code IS NOT NULL;
