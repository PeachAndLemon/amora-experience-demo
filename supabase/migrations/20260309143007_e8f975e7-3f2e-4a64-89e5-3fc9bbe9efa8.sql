
-- Admin changelog table
CREATE TABLE public.admin_changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL DEFAULT 'create',
  entity_type text NOT NULL DEFAULT 'event',
  entity_id text NOT NULL,
  entity_name text NOT NULL DEFAULT '',
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view changelog" ON public.admin_changelog
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert changelog" ON public.admin_changelog
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Onboarding survey history
CREATE TABLE public.onboarding_survey_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_id uuid,
  survey_number integer NOT NULL DEFAULT 1,
  relationship_season text,
  relationship_duration text,
  autopilot_level integer DEFAULT 5,
  rich_in text,
  rich_in_other text,
  want_more_of text[] DEFAULT '{}',
  gets_in_way text[] DEFAULT '{}',
  love_as_place text DEFAULT '',
  destination_feeling text,
  amora_wish text DEFAULT '',
  taken_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_survey_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own survey history" ON public.onboarding_survey_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey history" ON public.onboarding_survey_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User engagement tracking
CREATE TABLE public.user_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  engagement_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own engagement" ON public.user_engagement
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own engagement" ON public.user_engagement
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all engagement" ON public.user_engagement
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add next_survey_due to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_survey_due timestamptz;
