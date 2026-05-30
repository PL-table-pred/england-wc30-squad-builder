-- Public contact email for legal / AdSense pages (editable from admin settings).

INSERT INTO public.app_settings (key, value)
VALUES ('contact_email', '')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_contest_settings()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'submissions_locked',
    COALESCE(
      (SELECT value = 'true' FROM public.app_settings WHERE key = 'submissions_locked'),
      false
    ),
    'contact_email',
    (SELECT NULLIF(trim(value), '') FROM public.app_settings WHERE key = 'contact_email')
  );
$$;

CREATE OR REPLACE FUNCTION public.set_contact_email(
  p_contact_email text,
  p_admin_secret text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  v_email := NULLIF(trim(COALESCE(p_contact_email, '')), '');

  IF v_email IS NOT NULL AND v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  INSERT INTO public.app_settings (key, value)
  VALUES ('contact_email', COALESCE(v_email, ''))
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  RETURN public.get_contest_settings();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_contact_email(text, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.set_contact_email(text, text) FROM anon;
