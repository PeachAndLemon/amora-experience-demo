-- Create the trigger to auto-create profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert the missing profile for the existing user
INSERT INTO public.profiles (user_id, partner1_name, partner2_name, couple_name)
VALUES ('c817276d-3c71-4338-895f-a0f11e79023f', '', '', '')
ON CONFLICT (user_id) DO NOTHING;