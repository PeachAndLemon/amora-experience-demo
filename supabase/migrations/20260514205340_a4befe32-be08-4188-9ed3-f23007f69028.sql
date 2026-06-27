CREATE OR REPLACE FUNCTION public.gen_hex_qr_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE candidate text; cnt int;
BEGIN
  LOOP
    candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    SELECT count(*) INTO cnt FROM public.admin_events WHERE qr_short_code = candidate;
    EXIT WHEN cnt = 0;
  END LOOP;
  RETURN candidate;
END;
$function$;