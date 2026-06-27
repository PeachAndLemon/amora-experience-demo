
-- Prevent direct modification of partner_id / partner_connected / user_id on profiles by clients.
-- SECURITY DEFINER functions (link/accept/unlink) run as table owner and bypass these column grants.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (partner1_name, partner2_name, couple_name, relationship_season, relationship_duration, start_date, next_survey_due, updated_at)
  ON public.profiles TO authenticated;

-- Belt-and-suspenders: restrictive policy ensures only admins (via SECURITY DEFINER bypass not affected) can insert into user_roles.
CREATE POLICY "Block non-admin role inserts"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
