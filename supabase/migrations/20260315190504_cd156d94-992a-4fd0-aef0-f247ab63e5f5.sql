
-- 1. Create partner_link_requests table
CREATE TABLE public.partner_link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_link_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see requests they sent or received
CREATE POLICY "Users can view own requests" ON public.partner_link_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS: Users can insert requests where they are the sender
CREATE POLICY "Users can send requests" ON public.partner_link_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- RLS: Users can update requests they received (to accept/reject) or sent (to cancel)
CREATE POLICY "Users can update own requests" ON public.partner_link_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 2. Fix profiles UPDATE policy: add WITH CHECK so users can only set their own user_id
-- Drop and recreate the update policy with WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Replace link_partner function: now creates a request instead of directly linking
CREATE OR REPLACE FUNCTION public.link_partner(partner_code_input text)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  partner_user_id UUID;
  existing_request UUID;
BEGIN
  -- Find the partner's user_id from their code
  SELECT user_id INTO partner_user_id
  FROM public.profiles
  WHERE partner_code = partner_code_input
    AND user_id != auth.uid();

  IF partner_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if there's already a pending request between these users
  SELECT id INTO existing_request
  FROM public.partner_link_requests
  WHERE status = 'pending'
    AND ((sender_id = auth.uid() AND receiver_id = partner_user_id)
      OR (sender_id = partner_user_id AND receiver_id = auth.uid()));

  IF existing_request IS NOT NULL THEN
    RETURN false; -- already pending
  END IF;

  -- Check if either user is already connected
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id IN (auth.uid(), partner_user_id)
      AND partner_connected = true
  ) THEN
    RETURN false;
  END IF;

  -- Create the link request
  INSERT INTO public.partner_link_requests (sender_id, receiver_id, status)
  VALUES (auth.uid(), partner_user_id, 'pending');

  RETURN true;
END;
$$;

-- 4. Accept partner link request function
CREATE OR REPLACE FUNCTION public.accept_partner_link(request_id UUID)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  req RECORD;
  sender_profile_id UUID;
  receiver_profile_id UUID;
BEGIN
  -- Get the request, must be pending and addressed to current user
  SELECT * INTO req
  FROM public.partner_link_requests
  WHERE id = request_id
    AND receiver_id = auth.uid()
    AND status = 'pending';

  IF req IS NULL THEN
    RETURN false;
  END IF;

  -- Get both profile IDs
  SELECT id INTO sender_profile_id FROM public.profiles WHERE user_id = req.sender_id;
  SELECT id INTO receiver_profile_id FROM public.profiles WHERE user_id = req.receiver_id;

  IF sender_profile_id IS NULL OR receiver_profile_id IS NULL THEN
    RETURN false;
  END IF;

  -- Link both profiles
  UPDATE public.profiles
  SET partner_id = receiver_profile_id, partner_connected = true
  WHERE user_id = req.sender_id;

  UPDATE public.profiles
  SET partner_id = sender_profile_id, partner_connected = true
  WHERE user_id = req.receiver_id;

  -- Mark request as accepted
  UPDATE public.partner_link_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = request_id;

  -- Cancel any other pending requests for either user
  UPDATE public.partner_link_requests
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'pending'
    AND id != request_id
    AND (sender_id IN (req.sender_id, req.receiver_id)
      OR receiver_id IN (req.sender_id, req.receiver_id));

  RETURN true;
END;
$$;

-- 5. Reject partner link request function
CREATE OR REPLACE FUNCTION public.reject_partner_link(request_id UUID)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.partner_link_requests
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id
    AND receiver_id = auth.uid()
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

-- 6. Unlink partner function (security definer to update both profiles)
CREATE OR REPLACE FUNCTION public.unlink_partner()
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  my_partner_id UUID;
BEGIN
  -- Get current partner_id
  SELECT partner_id INTO my_partner_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF my_partner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Disconnect partner's profile
  UPDATE public.profiles
  SET partner_id = NULL, partner_connected = false
  WHERE id = my_partner_id;

  -- Disconnect current user's profile
  UPDATE public.profiles
  SET partner_id = NULL, partner_connected = false
  WHERE user_id = auth.uid();

  RETURN true;
END;
$$;
