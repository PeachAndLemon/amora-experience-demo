
-- ============ STAMPS: criteria fields ============
ALTER TABLE public.admin_stamps
  ADD COLUMN IF NOT EXISTS criteria_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS criteria_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unlock_criteria text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Allowed criteria types
ALTER TABLE public.admin_stamps DROP CONSTRAINT IF EXISTS admin_stamps_criteria_type_check;
ALTER TABLE public.admin_stamps ADD CONSTRAINT admin_stamps_criteria_type_check
  CHECK (criteria_type IN ('manual','event_checkin','activity_completion','milestone_progress'));

-- One stamp per user
CREATE UNIQUE INDEX IF NOT EXISTS earned_stamps_user_stamp_uniq
  ON public.earned_stamps(user_id, stamp_id);

-- ============ REWARDS: drop badges, add partner_reward ============
UPDATE public.admin_rewards SET type = 'perk' WHERE type = 'badge';
ALTER TABLE public.admin_rewards DROP CONSTRAINT IF EXISTS admin_rewards_type_check;
ALTER TABLE public.admin_rewards ADD CONSTRAINT admin_rewards_type_check
  CHECK (type IN ('perk','experience','partner_reward'));

-- ============ AUTO-AWARD STAMPS ============
CREATE OR REPLACE FUNCTION public.evaluate_stamps_for_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  cnt int;
BEGIN
  FOR s IN
    SELECT st.id, st.milestone_key, st.criteria_type, st.criteria_count, m.key AS mkey
    FROM public.admin_stamps st
    LEFT JOIN public.admin_milestones m ON m.key = st.milestone_key
    WHERE st.is_active = true AND st.criteria_type <> 'manual'
  LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM public.earned_stamps
               WHERE user_id = _user_id AND stamp_id = s.id::text) THEN
      CONTINUE;
    END IF;

    cnt := 0;

    IF s.criteria_type = 'event_checkin' THEN
      SELECT count(*) INTO cnt
      FROM public.event_checkins ec
      JOIN public.admin_events ae ON ae.id = ec.event_id
      WHERE ec.user_id = _user_id AND ae.milestone_id = s.milestone_key;
    ELSIF s.criteria_type = 'activity_completion' THEN
      SELECT count(*) INTO cnt
      FROM public.activity_completions
      WHERE user_id = _user_id AND milestone_id = s.milestone_key;
    ELSIF s.criteria_type = 'milestone_progress' THEN
      SELECT
        (SELECT count(*) FROM public.activity_completions
          WHERE user_id = _user_id AND milestone_id = s.milestone_key)
        +
        (SELECT count(*) FROM public.event_checkins ec2
          JOIN public.admin_events ae2 ON ae2.id = ec2.event_id
          WHERE ec2.user_id = _user_id AND ae2.milestone_id = s.milestone_key)
      INTO cnt;
    END IF;

    IF cnt >= GREATEST(s.criteria_count, 1) THEN
      INSERT INTO public.earned_stamps(user_id, milestone_id, stamp_id)
      VALUES (_user_id, s.milestone_key, s.id::text)
      ON CONFLICT (user_id, stamp_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.evaluate_stamps_for_user(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.evaluate_stamps_for_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.trg_award_stamps_after_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.evaluate_stamps_for_user(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_award_stamps_after_checkin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.evaluate_stamps_for_user(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_stamps_after_activity ON public.activity_completions;
CREATE TRIGGER award_stamps_after_activity
AFTER INSERT ON public.activity_completions
FOR EACH ROW EXECUTE FUNCTION public.trg_award_stamps_after_activity();

DROP TRIGGER IF EXISTS award_stamps_after_checkin ON public.event_checkins;
CREATE TRIGGER award_stamps_after_checkin
AFTER INSERT ON public.event_checkins
FOR EACH ROW EXECUTE FUNCTION public.trg_award_stamps_after_checkin();

-- ============ NEW EVENT NOTIFICATIONS ============
CREATE OR REPLACE FUNCTION public.notify_users_of_new_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO public.notifications(user_id, type, title, body, data)
    SELECT p.user_id, 'new_event',
           'New live experience: ' || NEW.name,
           COALESCE(NULLIF(NEW.venue,''), 'Tap to explore') ||
             CASE WHEN NEW.event_date IS NOT NULL
                  THEN ' • ' || to_char(NEW.event_date, 'Mon DD')
                  ELSE '' END,
           jsonb_build_object('event_id', NEW.id, 'milestone_id', NEW.milestone_id)
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_users_of_event_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Newly activated (was inactive, now active)
  IF (OLD.is_active = false AND NEW.is_active = true) THEN
    INSERT INTO public.notifications(user_id, type, title, body, data)
    SELECT p.user_id, 'new_event',
           'New live experience: ' || NEW.name,
           COALESCE(NULLIF(NEW.venue,''), 'Tap to explore'),
           jsonb_build_object('event_id', NEW.id, 'milestone_id', NEW.milestone_id)
    FROM public.profiles p;
  END IF;
  -- Deactivated: remove pending notifications
  IF (OLD.is_active = true AND NEW.is_active = false) THEN
    DELETE FROM public.notifications
     WHERE type = 'new_event' AND data->>'event_id' = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_event_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications
   WHERE type = 'new_event' AND data->>'event_id' = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS notify_new_event ON public.admin_events;
CREATE TRIGGER notify_new_event
AFTER INSERT ON public.admin_events
FOR EACH ROW EXECUTE FUNCTION public.notify_users_of_new_event();

DROP TRIGGER IF EXISTS notify_event_status ON public.admin_events;
CREATE TRIGGER notify_event_status
AFTER UPDATE OF is_active ON public.admin_events
FOR EACH ROW EXECUTE FUNCTION public.notify_users_of_event_update();

DROP TRIGGER IF EXISTS cleanup_event_notif ON public.admin_events;
CREATE TRIGGER cleanup_event_notif
AFTER DELETE ON public.admin_events
FOR EACH ROW EXECUTE FUNCTION public.cleanup_event_notifications();
