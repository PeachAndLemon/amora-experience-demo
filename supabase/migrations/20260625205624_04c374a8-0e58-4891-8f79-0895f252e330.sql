
-- 1. admin_rewards.code: re-apply column-level revoke (defense-in-depth)
REVOKE SELECT (code) ON public.admin_rewards FROM PUBLIC;
REVOKE SELECT (code) ON public.admin_rewards FROM anon;
REVOKE SELECT (code) ON public.admin_rewards FROM authenticated;

-- 2. promo_codes.code: revoke read of secret code column from non-admins
REVOKE SELECT (code) ON public.promo_codes FROM PUBLIC;
REVOKE SELECT (code) ON public.promo_codes FROM anon;
REVOKE SELECT (code) ON public.promo_codes FROM authenticated;

-- Admin-only RPC returning full promo_codes rows (incl. code)
CREATE OR REPLACE FUNCTION public.admin_list_promo_codes()
RETURNS SETOF public.promo_codes
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.promo_codes ORDER BY created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_list_promo_codes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_promo_codes() TO authenticated;

-- 3. profiles.partner_code: prevent partner from reading the other user's invite code
REVOKE SELECT (partner_code) ON public.profiles FROM PUBLIC;
REVOKE SELECT (partner_code) ON public.profiles FROM anon;
REVOKE SELECT (partner_code) ON public.profiles FROM authenticated;

-- Owner-only RPC so the current user can still read their own partner_code
CREATE OR REPLACE FUNCTION public.get_my_partner_code()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_code FROM public.profiles WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_partner_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_partner_code() TO authenticated;

-- 4. reward_redemptions: remove direct INSERT policy; route through open_reward() RPC only
DROP POLICY IF EXISTS "Users insert own reward redemptions" ON public.reward_redemptions;

-- Strengthen open_reward() with a minimal entitlement check (reward must exist and be active)
CREATE OR REPLACE FUNCTION public.open_reward(reward_id_input text, reward_name_input text, duration_minutes_input integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); rid uuid; exp timestamptz; r_exists boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Entitlement check: reward must exist in admin_rewards and be active.
  -- (Mock-only rewards that have never been persisted to admin_rewards are allowed
  --  through to preserve current product behavior; tighten further when reward
  --  ownership/unlock tracking is moved server-side.)
  SELECT EXISTS (
    SELECT 1 FROM public.admin_rewards
    WHERE id = reward_id_input AND is_active = true
  ) INTO r_exists;

  IF EXISTS (SELECT 1 FROM public.admin_rewards WHERE id = reward_id_input) AND NOT r_exists THEN
    RAISE EXCEPTION 'Reward is not currently available';
  END IF;

  exp := CASE WHEN duration_minutes_input IS NOT NULL AND duration_minutes_input > 0
              THEN now() + (duration_minutes_input || ' minutes')::interval ELSE NULL END;
  INSERT INTO public.reward_redemptions(user_id, reward_id, reward_name, expires_at)
  VALUES (uid, reward_id_input, reward_name_input, exp) RETURNING id INTO rid;
  RETURN rid;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.open_reward(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_reward(text, text, integer) TO authenticated;
