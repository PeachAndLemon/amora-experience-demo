-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  partner1_name TEXT NOT NULL DEFAULT '',
  partner2_name TEXT NOT NULL DEFAULT '',
  couple_name TEXT NOT NULL DEFAULT '',
  relationship_season TEXT CHECK (relationship_season IN ('building', 'committed', 'established')),
  relationship_duration TEXT CHECK (relationship_duration IN ('0-2', '2-5', '5-10', '10+')),
  start_date TIMESTAMPTZ DEFAULT now(),
  partner_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  partner_id UUID REFERENCES public.profiles(id),
  partner_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create onboarding_answers table for deep onboarding data
CREATE TABLE public.onboarding_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  autopilot_level INTEGER DEFAULT 5 CHECK (autopilot_level >= 1 AND autopilot_level <= 10),
  rich_in TEXT CHECK (rich_in IN ('trust-reliability', 'life-logistics', 'ideas-ambition', 'comfort-familiarity', 'other')),
  rich_in_other TEXT,
  want_more_of TEXT[] DEFAULT '{}',
  gets_in_way TEXT[] DEFAULT '{}',
  love_as_place TEXT DEFAULT '',
  destination_feeling TEXT CHECK (destination_feeling IN ('attunement', 'vitality', 'safe-haven', 'co-adventure')),
  amora_wish TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activity_completions table for tracking progress
CREATE TABLE public.activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  preference_signals TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_id)
);

-- Create event_checkins table for tracking event attendance
CREATE TABLE public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL,
  stamp_earned BOOLEAN DEFAULT true,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create earned_stamps table for tracking stamps
CREATE TABLE public.earned_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stamp_id TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, stamp_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_stamps ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view partner profile"
  ON public.profiles FOR SELECT
  USING (id = (SELECT partner_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Onboarding answers RLS policies
CREATE POLICY "Users can view own onboarding answers"
  ON public.onboarding_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding answers"
  ON public.onboarding_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding answers"
  ON public.onboarding_answers FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity completions RLS policies
CREATE POLICY "Users can view own activity completions"
  ON public.activity_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity completions"
  ON public.activity_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity completions"
  ON public.activity_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Event checkins RLS policies
CREATE POLICY "Users can view own event checkins"
  ON public.event_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event checkins"
  ON public.event_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Earned stamps RLS policies
CREATE POLICY "Users can view own earned stamps"
  ON public.earned_stamps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earned stamps"
  ON public.earned_stamps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_answers_updated_at
  BEFORE UPDATE ON public.onboarding_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to link partners by code
CREATE OR REPLACE FUNCTION public.link_partner(partner_code_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  partner_profile_id UUID;
  current_profile_id UUID;
BEGIN
  -- Get the partner's profile ID from their code
  SELECT id INTO partner_profile_id
  FROM public.profiles
  WHERE partner_code = partner_code_input
    AND user_id != auth.uid();
  
  IF partner_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get current user's profile ID
  SELECT id INTO current_profile_id
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- Update both profiles to link them
  UPDATE public.profiles
  SET partner_id = partner_profile_id, partner_connected = true
  WHERE user_id = auth.uid();
  
  UPDATE public.profiles
  SET partner_id = current_profile_id, partner_connected = true
  WHERE id = partner_profile_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;