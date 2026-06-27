
-- 1. Storage: remove broad SELECT policy so clients can't list bucket contents.
--    Public URLs for event-images still work because the bucket is marked public.
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;

-- 2. Revoke EXECUTE on trigger-only / internal SECURITY DEFINER functions
--    from PUBLIC, anon, and authenticated. They still run via triggers (owner).
DO $$
DECLARE fn text;
BEGIN
  FOR fn IN SELECT unnest(ARRAY[
    'public.create_partner_request_notification()',
    'public.gen_hex_qr_code()',
    'public.set_event_qr_code()',
    'public.handle_new_user()',
    'public.cleanup_event_notifications()',
    'public.trg_award_stamps_after_activity()',
    'public.trg_award_stamps_after_checkin()',
    'public.notify_users_of_new_event()',
    'public.notify_users_of_event_update()',
    'public.trg_recompute_stamps_for_all()',
    'public.evaluate_stamps_for_user(uuid)',
    'public.update_updated_at_column()'
  ]) LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
  END LOOP;
END $$;
