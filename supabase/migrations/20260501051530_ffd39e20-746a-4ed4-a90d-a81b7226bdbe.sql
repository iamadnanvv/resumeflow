-- 1) Enum for resume creation source
DO $$ BEGIN
  CREATE TYPE public.resume_creation_source AS ENUM ('scratch','template','onboarding','cloned_showcase','imported');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.showcase_status AS ENUM ('none','submitted','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Creation events table
CREATE TABLE IF NOT EXISTS public.resume_creation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL,
  user_id uuid NOT NULL,
  source public.resume_creation_source NOT NULL DEFAULT 'scratch',
  cloned_from_resume_id uuid,
  ai_assist_count integer NOT NULL DEFAULT 0,
  template_slug text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_creation_events_resume ON public.resume_creation_events(resume_id);
CREATE INDEX IF NOT EXISTS idx_creation_events_user ON public.resume_creation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_creation_events_source ON public.resume_creation_events(source);

ALTER TABLE public.resume_creation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own creation events"
  ON public.resume_creation_events FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own creation events"
  ON public.resume_creation_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own creation events"
  ON public.resume_creation_events FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_creation_events_updated
  BEFORE UPDATE ON public.resume_creation_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) Extend resumes table with showcase fields
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS showcase_status public.showcase_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS showcase_anonymized_content jsonb,
  ADD COLUMN IF NOT EXISTS showcase_title text,
  ADD COLUMN IF NOT EXISTS showcase_industry text,
  ADD COLUMN IF NOT EXISTS showcase_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS showcase_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS showcase_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS showcase_admin_notes text,
  ADD COLUMN IF NOT EXISTS cloned_from_resume_id uuid;

CREATE INDEX IF NOT EXISTS idx_resumes_showcase_status ON public.resumes(showcase_status);

-- 4) Public read for approved showcase entries
DROP POLICY IF EXISTS "Public can view approved showcase resumes" ON public.resumes;
CREATE POLICY "Public can view approved showcase resumes"
  ON public.resumes FOR SELECT
  USING (showcase_status = 'approved');

-- 5) Admin can update showcase fields on any resume
DROP POLICY IF EXISTS "Admins curate showcase" ON public.resumes;
CREATE POLICY "Admins curate showcase"
  ON public.resumes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 6) Helper: increment ai_assist_count safely
CREATE OR REPLACE FUNCTION public.increment_ai_assist(_resume_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.resume_creation_events (resume_id, user_id, source, ai_assist_count)
  SELECT r.id, r.user_id, 'scratch', 1
  FROM public.resumes r
  WHERE r.id = _resume_id
  ON CONFLICT (resume_id) DO UPDATE
    SET ai_assist_count = public.resume_creation_events.ai_assist_count + 1,
        updated_at = now();
END;
$$;