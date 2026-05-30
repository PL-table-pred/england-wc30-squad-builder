-- Read-only check for admin secret (homepage /admin unlock without login).
CREATE OR REPLACE FUNCTION public.check_admin_secret(p_admin_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_secret text;
BEGIN
  IF p_admin_secret IS NULL OR char_length(trim(p_admin_secret)) = 0 THEN
    RETURN false;
  END IF;

  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  RETURN stored_secret IS NOT NULL AND p_admin_secret = stored_secret;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_admin_secret(text) TO anon, authenticated;
