
-- Resumes: public sharing
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS public_slug text,
  ADD COLUMN IF NOT EXISTS public_view_count integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS resumes_public_slug_key
  ON public.resumes (public_slug)
  WHERE public_slug IS NOT NULL;

DROP POLICY IF EXISTS "Public can view shared resumes by slug" ON public.resumes;
CREATE POLICY "Public can view shared resumes by slug"
  ON public.resumes FOR SELECT
  USING (is_public = true AND public_slug IS NOT NULL);

-- Resume views
CREATE TABLE IF NOT EXISTS public.resume_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  referrer text,
  country text,
  user_agent text
);
CREATE INDEX IF NOT EXISTS resume_views_resume_id_idx ON public.resume_views(resume_id);
CREATE INDEX IF NOT EXISTS resume_views_viewed_at_idx ON public.resume_views(viewed_at DESC);

ALTER TABLE public.resume_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record a view" ON public.resume_views;
CREATE POLICY "Anyone can record a view"
  ON public.resume_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners view their resume analytics" ON public.resume_views;
CREATE POLICY "Owners view their resume analytics"
  ON public.resume_views FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_views.resume_id AND r.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Applications
DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('saved','applied','interview','offer','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  role text,
  job_url text,
  job_description text,
  status public.application_status NOT NULL DEFAULT 'saved',
  applied_at date,
  next_step_at date,
  notes text,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter_id uuid REFERENCES public.cover_letters(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS applications_resume_id_idx ON public.applications(resume_id);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own applications" ON public.applications;
CREATE POLICY "Users view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users insert own applications" ON public.applications;
CREATE POLICY "Users insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own applications" ON public.applications;
CREATE POLICY "Users update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own applications" ON public.applications;
CREATE POLICY "Users delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS applications_touch_updated_at ON public.applications;
CREATE TRIGGER applications_touch_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
