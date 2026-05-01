REVOKE EXECUTE ON FUNCTION public.increment_ai_assist(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_ai_assist(uuid) TO authenticated, service_role;