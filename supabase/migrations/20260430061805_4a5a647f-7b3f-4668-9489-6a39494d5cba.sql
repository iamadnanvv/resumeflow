-- 1. Extend app_plan enum with teacher tiers
ALTER TYPE public.app_plan ADD VALUE IF NOT EXISTS 'teacher_basic';
ALTER TYPE public.app_plan ADD VALUE IF NOT EXISTS 'teacher_premium';
ALTER TYPE public.app_plan ADD VALUE IF NOT EXISTS 'teacher_pro';

-- 2. user_type enum
DO $$ BEGIN
  CREATE TYPE public.user_type AS ENUM ('student','professional','teacher');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Profiles: user_type + referral_code
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type public.user_type,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate short referral codes for existing users
CREATE OR REPLACE FUNCTION public.gen_referral_code()
RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT upper(substring(replace(gen_random_uuid()::text,'-',''),1,8));
$$;

UPDATE public.profiles
SET referral_code = public.gen_referral_code()
WHERE referral_code IS NULL;

-- 4. student_verifications: add kind so we can reuse for teachers
DO $$ BEGIN
  CREATE TYPE public.verification_kind AS ENUM ('student','teacher');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.student_verifications
  ADD COLUMN IF NOT EXISTS kind public.verification_kind NOT NULL DEFAULT 'student';

-- 5. is_verified_for(user, kind)
CREATE OR REPLACE FUNCTION public.is_verified_for(_user_id uuid, _kind public.verification_kind)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_verifications
    WHERE user_id = _user_id AND verified = true AND kind = _kind
  )
$$;

-- 6. Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL UNIQUE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | rewarded
  reward_amount integer NOT NULL DEFAULT 0, -- in INR rupees
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view referrals they're part of"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Only service role inserts/updates referrals (no user policies for write)

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);

CREATE TRIGGER trg_referrals_updated
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 7. User credits ledger (balance summary per user)
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0,        -- INR rupees available
  lifetime_earned integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits"
  ON public.user_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Writes restricted to service role only (no user write policies)

CREATE TRIGGER trg_user_credits_updated
BEFORE UPDATE ON public.user_credits
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 8. Update handle_new_user to include referral_code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, phone, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    public.gen_referral_code()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.user_credits (user_id, balance, lifetime_earned) VALUES (NEW.id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill credits rows for existing users
INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
SELECT id, 0, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;