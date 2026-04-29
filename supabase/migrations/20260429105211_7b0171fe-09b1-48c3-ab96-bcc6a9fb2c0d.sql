-- Student verification table
CREATE TABLE public.student_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  code_hash text,
  expires_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_verifications_user ON public.student_verifications(user_id);
CREATE UNIQUE INDEX idx_student_verifications_user_email ON public.student_verifications(user_id, lower(email));

ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own student verifications"
  ON public.student_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own student verifications"
  ON public.student_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own student verifications"
  ON public.student_verifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_student_verifications_touch
  BEFORE UPDATE ON public.student_verifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Helper: is the user a verified student?
CREATE OR REPLACE FUNCTION public.is_verified_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_verifications
    WHERE user_id = _user_id AND verified = true
  )
$$;