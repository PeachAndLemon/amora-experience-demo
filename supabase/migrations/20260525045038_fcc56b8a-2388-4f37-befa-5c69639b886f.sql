
-- 1. Re-confirm column-level revoke for admin_rewards.code
REVOKE SELECT (code) ON public.admin_rewards FROM anon, authenticated;

-- 2. Remove direct user INSERT on earned_stamps (SECURITY DEFINER funcs bypass RLS)
DROP POLICY IF EXISTS "Users can insert own earned stamps" ON public.earned_stamps;
DROP POLICY IF EXISTS "Users can delete own earned stamps" ON public.earned_stamps;

-- 3. Remove direct user INSERT on event_checkins (only validate_event_checkin should insert)
DROP POLICY IF EXISTS "Users can insert own event checkins" ON public.event_checkins;
DROP POLICY IF EXISTS "Users can delete own event checkins" ON public.event_checkins;

-- 4. Rotate partner_code on link so neither partner can reuse the other's invite code
CREATE OR REPLACE FUNCTION public.accept_partner_link(request_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  req RECORD;
  sender_profile_id UUID;
  receiver_profile_id UUID;
BEGIN
  SELECT * INTO req
  FROM public.partner_link_requests
  WHERE id = request_id
    AND receiver_id = auth.uid()
    AND status = 'pending';

  IF req IS NULL THEN
    RETURN false;
  END IF;

  SELECT id INTO sender_profile_id FROM public.profiles WHERE user_id = req.sender_id;
  SELECT id INTO receiver_profile_id FROM public.profiles WHERE user_id = req.receiver_id;

  IF sender_profile_id IS NULL OR receiver_profile_id IS NULL THEN
    RETURN false;
  END IF;

  -- Link both profiles and rotate their partner_code so the original invite codes
  -- can no longer be reused or shared by the linked partner.
  UPDATE public.profiles
  SET partner_id = receiver_profile_id,
      partner_connected = true,
      partner_code = substr(md5(random()::text || clock_timestamp()::text), 1, 8)
  WHERE user_id = req.sender_id;

  UPDATE public.profiles
  SET partner_id = sender_profile_id,
      partner_connected = true,
      partner_code = substr(md5(random()::text || clock_timestamp()::text), 1, 8)
  WHERE user_id = req.receiver_id;

  UPDATE public.partner_link_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = request_id;

  UPDATE public.partner_link_requests
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'pending'
    AND id != request_id
    AND (sender_id IN (req.sender_id, req.receiver_id)
      OR receiver_id IN (req.sender_id, req.receiver_id));

  RETURN true;
END;
$function$;
