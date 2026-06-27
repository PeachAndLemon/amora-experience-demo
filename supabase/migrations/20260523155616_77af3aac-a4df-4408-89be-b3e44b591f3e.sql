
-- Restrict the sensitive `code` column on admin_rewards so regular signed-in users
-- cannot read promo/redemption codes via the broad "Anyone can view active rewards" policy.
REVOKE SELECT (code) ON public.admin_rewards FROM anon, authenticated;

-- Provide an admin-only RPC so the admin UI can still read every column, including `code`.
CREATE OR REPLACE FUNCTION public.admin_list_rewards()
RETURNS SETOF public.admin_rewards
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.admin_rewards ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_rewards() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_rewards() TO authenticated;
