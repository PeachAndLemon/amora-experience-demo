-- Add DELETE policies for account deletion functionality

-- Allow users to delete their own activity completions
CREATE POLICY "Users can delete own activity completions"
ON public.activity_completions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own earned stamps
CREATE POLICY "Users can delete own earned stamps"
ON public.earned_stamps
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own event checkins
CREATE POLICY "Users can delete own event checkins"
ON public.event_checkins
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own onboarding answers
CREATE POLICY "Users can delete own onboarding answers"
ON public.onboarding_answers
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);