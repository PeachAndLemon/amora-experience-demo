
CREATE OR REPLACE FUNCTION public.lookup_partner_by_code(code_input text)
RETURNS TABLE(name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(NULLIF(partner1_name,''), NULLIF(couple_name,''), 'Unknown')
  FROM public.profiles
  WHERE partner_code = lower(trim(code_input)) AND user_id != auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.create_partner_request_notification() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sender_name text;
BEGIN
  SELECT COALESCE(NULLIF(partner1_name,''),'Someone') INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  INSERT INTO public.notifications(user_id, type, title, body, data)
  VALUES (NEW.receiver_id, 'partner_request', 'New partner link request',
          sender_name || ' wants to link their account with yours.',
          jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_partner_request_notif ON public.partner_link_requests;
CREATE TRIGGER trg_partner_request_notif AFTER INSERT ON public.partner_link_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_partner_request_notification();

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid, target_role app_role, grant_role boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF target_user_id = auth.uid() AND target_role = 'admin' AND NOT grant_role THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  IF grant_role THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (target_user_id, target_role) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = target_role;
  END IF;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_user_overview()
RETURNS TABLE(user_id uuid, partner1_name text, partner2_name text, couple_name text,
              partner_connected boolean, created_at timestamptz, is_admin boolean,
              activity_count int, event_checkin_count int, reward_redemption_count int, engagement_count int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.user_id, p.partner1_name, p.partner2_name, p.couple_name, p.partner_connected, p.created_at,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin'),
    (SELECT count(*)::int FROM public.activity_completions WHERE user_id = p.user_id),
    (SELECT count(*)::int FROM public.event_checkins WHERE user_id = p.user_id),
    (SELECT count(*)::int FROM public.reward_redemptions WHERE user_id = p.user_id),
    (SELECT count(*)::int FROM public.user_engagement WHERE user_id = p.user_id)
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY p.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.redeem_promo_code(code_input text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pc public.promo_codes%ROWTYPE; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;
  SELECT * INTO pc FROM public.promo_codes WHERE upper(code) = upper(trim(code_input));
  IF pc IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Invalid code'); END IF;
  IF NOT pc.is_active THEN RETURN jsonb_build_object('success', false, 'error', 'Code disabled'); END IF;
  IF pc.valid_from IS NOT NULL AND pc.valid_from > now() THEN RETURN jsonb_build_object('success', false, 'error', 'Not yet active'); END IF;
  IF pc.valid_until IS NOT NULL AND pc.valid_until < now() THEN RETURN jsonb_build_object('success', false, 'error', 'Expired'); END IF;
  IF pc.max_uses IS NOT NULL AND pc.uses >= pc.max_uses THEN RETURN jsonb_build_object('success', false, 'error', 'Fully redeemed'); END IF;
  IF pc.type = 'demo' THEN
    UPDATE public.promo_codes SET uses = uses + 1 WHERE id = pc.id;
    RETURN jsonb_build_object('success', true, 'type', 'demo', 'name', pc.name);
  END IF;
  BEGIN
    INSERT INTO public.promo_redemptions(user_id, promo_id) VALUES (uid, pc.id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already redeemed');
  END;
  UPDATE public.promo_codes SET uses = uses + 1 WHERE id = pc.id;
  RETURN jsonb_build_object('success', true, 'type', pc.type, 'name', pc.name, 'reward_id', pc.reward_id);
END; $$;

CREATE OR REPLACE FUNCTION public.open_reward(reward_id_input text, reward_name_input text, duration_minutes_input int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); rid uuid; exp timestamptz;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  exp := CASE WHEN duration_minutes_input IS NOT NULL AND duration_minutes_input > 0
              THEN now() + (duration_minutes_input || ' minutes')::interval ELSE NULL END;
  INSERT INTO public.reward_redemptions(user_id, reward_id, reward_name, expires_at)
  VALUES (uid, reward_id_input, reward_name_input, exp) RETURNING id INTO rid;
  RETURN rid;
END; $$;

CREATE OR REPLACE FUNCTION public.mark_reward_used(redemption_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.reward_redemptions SET used_at = now()
   WHERE id = redemption_id AND user_id = auth.uid() AND used_at IS NULL;
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_event_checkin(qr_code_input text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev public.admin_events%ROWTYPE; uid uuid := auth.uid();
        short_code text := upper(replace(trim(qr_code_input), 'AMORA-', ''));
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;
  SELECT * INTO ev FROM public.admin_events WHERE qr_short_code = short_code AND is_active = true;
  IF ev IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code'); END IF;
  IF ev.qr_expires_at IS NOT NULL AND ev.qr_expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'QR code expired');
  END IF;
  IF EXISTS (SELECT 1 FROM public.event_checkins WHERE user_id = uid AND event_id = ev.id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already checked in', 'event_id', ev.id);
  END IF;
  INSERT INTO public.event_checkins(user_id, event_id, stamp_earned) VALUES (uid, ev.id, true);
  INSERT INTO public.earned_stamps(user_id, milestone_id, stamp_id) VALUES (uid, ev.milestone_id, ev.id);
  RETURN jsonb_build_object('success', true, 'event_id', ev.id, 'event_name', ev.name,
                            'milestone_id', ev.milestone_id, 'stamp_name', ev.stamp_name,
                            'stamp_icon_id', ev.stamp_icon_id);
END; $$;

-- EXECUTE lockdown across all SECURITY DEFINER functions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef=true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon', r.proname, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated', r.proname, r.args);
  END LOOP;
END $$;
