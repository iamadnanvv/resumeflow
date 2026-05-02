
CREATE OR REPLACE FUNCTION public.enforce_showcase_weekly_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  -- Only enforce when transitioning into 'submitted'
  IF NEW.showcase_status = 'submitted'
     AND (TG_OP = 'INSERT' OR OLD.showcase_status IS DISTINCT FROM 'submitted') THEN
    SELECT count(*) INTO recent_count
    FROM public.resumes
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND showcase_submitted_at IS NOT NULL
      AND showcase_submitted_at > now() - interval '7 days';

    IF recent_count >= 1 THEN
      RAISE EXCEPTION 'Weekly limit reached: you can submit only 1 resume to the showcase per 7 days'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_showcase_weekly_limit ON public.resumes;
CREATE TRIGGER trg_showcase_weekly_limit
BEFORE INSERT OR UPDATE OF showcase_status ON public.resumes
FOR EACH ROW EXECUTE FUNCTION public.enforce_showcase_weekly_limit();
