
REVOKE EXECUTE ON FUNCTION public.trg_award_stamps_after_activity() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_stamps_after_checkin() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_users_of_new_event() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_users_of_event_update() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_event_notifications() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluate_stamps_for_user(uuid) FROM public, anon, authenticated;
