
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_milestones' AND policyname='View active milestones') THEN
    EXECUTE 'CREATE POLICY "View active milestones" ON public.admin_milestones FOR SELECT TO authenticated USING (is_active)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_milestones' AND policyname='Admins all milestones') THEN
    EXECUTE 'CREATE POLICY "Admins all milestones" ON public.admin_milestones FOR ALL TO authenticated USING (has_role(auth.uid(),''admin'')) WITH CHECK (has_role(auth.uid(),''admin''))';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_key text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_id text NOT NULL DEFAULT 'star',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_stamps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_stamps' AND policyname='View active stamps') THEN
    EXECUTE 'CREATE POLICY "View active stamps" ON public.admin_stamps FOR SELECT TO authenticated USING (is_active)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_stamps' AND policyname='Admins all stamps') THEN
    EXECUTE 'CREATE POLICY "Admins all stamps" ON public.admin_stamps FOR ALL TO authenticated USING (has_role(auth.uid(),''admin'')) WITH CHECK (has_role(auth.uid(),''admin''))';
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_admin_stamps_upd ON public.admin_stamps;
CREATE TRIGGER trg_admin_stamps_upd BEFORE UPDATE ON public.admin_stamps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'reward_unlock',
  reward_id text,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses int,
  uses int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_codes' AND policyname='Admins all promos') THEN
    EXECUTE 'CREATE POLICY "Admins all promos" ON public.promo_codes FOR ALL TO authenticated USING (has_role(auth.uid(),''admin'')) WITH CHECK (has_role(auth.uid(),''admin''))';
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_promo_codes_upd ON public.promo_codes;
CREATE TRIGGER trg_promo_codes_upd BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  promo_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, promo_id)
);
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_redemptions' AND policyname='Users view own promo redemptions') THEN
    EXECUTE 'CREATE POLICY "Users view own promo redemptions" ON public.promo_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_redemptions' AND policyname='Admins view all promo redemptions') THEN
    EXECUTE 'CREATE POLICY "Admins view all promo redemptions" ON public.promo_redemptions FOR SELECT TO authenticated USING (has_role(auth.uid(),''admin''))';
  END IF;
END $$;

INSERT INTO public.promo_codes (code, name, description, type, is_active)
VALUES ('AMORADEMO', 'Investor Demo Mode', 'Pre-fills stamps, levels, events, and activities for stakeholder demos.', 'demo', true)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users view own notifications') THEN
    EXECUTE 'CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users update own notifications') THEN
    EXECUTE 'CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
