
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS next_step_at date;
ALTER TABLE public.resume_views ADD COLUMN IF NOT EXISTS user_agent text;
