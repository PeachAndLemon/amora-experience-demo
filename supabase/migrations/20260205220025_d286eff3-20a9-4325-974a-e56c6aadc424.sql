-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view partner profile" ON public.profiles;

-- Create a security definer function to get the partner_id safely
CREATE OR REPLACE FUNCTION public.get_my_partner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id
  FROM public.profiles
  WHERE user_id = auth.uid()
$$;

-- Recreate the policy using the function
CREATE POLICY "Users can view partner profile"
ON public.profiles FOR SELECT
USING (id = public.get_my_partner_id());