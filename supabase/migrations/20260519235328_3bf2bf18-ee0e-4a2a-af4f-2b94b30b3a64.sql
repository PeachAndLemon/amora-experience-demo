
-- 1. Better sender name in partner request notification
CREATE OR REPLACE FUNCTION public.create_partner_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE sender_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(partner1_name),''), NULLIF(trim(couple_name),''), NULLIF(trim(partner2_name),''), 'Your partner')
    INTO sender_name
  FROM public.profiles WHERE user_id = NEW.sender_id;

  INSERT INTO public.notifications(user_id, type, title, body, data)
  VALUES (NEW.receiver_id, 'partner_request', 'New partner link request',
          sender_name || ' wants to link their account with yours.',
          jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id));
  RETURN NEW;
END; $function$;

-- 2. New event notifications: restrict to onboarded users + dedupe
CREATE OR REPLACE FUNCTION public.notify_users_of_new_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    FROM public.profiles p
    WHERE COALESCE(NULLIF(trim(p.partner1_name),''), NULLIF(trim(p.couple_name),'')) IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = p.user_id
          AND n.type = 'new_event'
          AND n.data->>'event_id' = NEW.id
      );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_users_of_event_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (OLD.is_active = false AND NEW.is_active = true) THEN
    INSERT INTO public.notifications(user_id, type, title, body, data)
    SELECT p.user_id, 'new_event',
           'New live experience: ' || NEW.name,
           COALESCE(NULLIF(NEW.venue,''), 'Tap to explore'),
           jsonb_build_object('event_id', NEW.id, 'milestone_id', NEW.milestone_id)
    FROM public.profiles p
    WHERE COALESCE(NULLIF(trim(p.partner1_name),''), NULLIF(trim(p.couple_name),'')) IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = p.user_id
          AND n.type = 'new_event'
          AND n.data->>'event_id' = NEW.id
      );
  END IF;
  IF (OLD.is_active = true AND NEW.is_active = false) THEN
    DELETE FROM public.notifications
     WHERE type = 'new_event' AND data->>'event_id' = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Recompute stamps for all users when admin changes criteria
CREATE OR REPLACE FUNCTION public.trg_recompute_stamps_for_all()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE u RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND
     NEW.criteria_type IS NOT DISTINCT FROM OLD.criteria_type AND
     NEW.criteria_count IS NOT DISTINCT FROM OLD.criteria_count AND
     NEW.milestone_key IS NOT DISTINCT FROM OLD.milestone_key AND
     NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN
    RETURN NEW;
  END IF;

  FOR u IN SELECT DISTINCT user_id FROM public.profiles LOOP
    PERFORM public.evaluate_stamps_for_user(u.user_id);
  END LOOP;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_recompute_stamps_on_admin_change ON public.admin_stamps;
CREATE TRIGGER trg_recompute_stamps_on_admin_change
AFTER INSERT OR UPDATE ON public.admin_stamps
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_stamps_for_all();
