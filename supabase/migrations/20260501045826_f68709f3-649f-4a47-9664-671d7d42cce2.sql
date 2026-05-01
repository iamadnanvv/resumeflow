-- Ledger of referral discounts actually granted, scoped per referee + plan
CREATE TABLE IF NOT EXISTS public.referral_discount_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referee_id uuid NOT NULL,
  referral_id uuid NOT NULL,
  plan public.app_plan NOT NULL,
  order_id text,
  payment_id uuid,
  discount_paise integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved', -- reserved | consumed | released
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one ACTIVE (reserved or consumed) redemption per referee+plan
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_redemption_active
  ON public.referral_discount_redemptions (referee_id, plan)
  WHERE status IN ('reserved','consumed');

ALTER TABLE public.referral_discount_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referral redemptions"
  ON public.referral_discount_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = referee_id);

CREATE TRIGGER trg_redemptions_updated
  BEFORE UPDATE ON public.referral_discount_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Self-referral detector: compares email + phone across auth.users
CREATE OR REPLACE FUNCTION public.is_self_referral(_referrer uuid, _referee uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users a
    JOIN auth.users b ON a.id = _referrer AND b.id = _referee
    WHERE a.id <> b.id
      AND (
        (a.email IS NOT NULL AND b.email IS NOT NULL AND lower(a.email) = lower(b.email))
        OR (a.phone IS NOT NULL AND b.phone IS NOT NULL AND a.phone = b.phone)
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.id = _referrer AND p2.id = _referee
    WHERE p1.id <> p2.id
      AND (
        (p1.phone IS NOT NULL AND p2.phone IS NOT NULL AND p1.phone = p2.phone)
        OR (p1.username IS NOT NULL AND p2.username IS NOT NULL AND lower(p1.username) = lower(p2.username))
      )
  );
$$;

-- Block inserts where referrer & referee look like the same person
CREATE OR REPLACE FUNCTION public.block_self_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referrer_id = NEW.referee_id THEN
    RAISE EXCEPTION 'Self-referral is not allowed';
  END IF;
  IF public.is_self_referral(NEW.referrer_id, NEW.referee_id) THEN
    RAISE EXCEPTION 'Referral blocked: accounts appear to belong to the same person';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_self_referral ON public.referrals;
CREATE TRIGGER trg_block_self_referral
  BEFORE INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.block_self_referral();