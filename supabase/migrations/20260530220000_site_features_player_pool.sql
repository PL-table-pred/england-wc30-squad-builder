-- Public site feature flags + per-player pool visibility (admin-controlled).

INSERT INTO public.app_settings (key, value)
VALUES
  ('youth_u21_enabled', 'true'),
  ('youth_u18_enabled', 'true'),
  ('stats_page_enabled', 'true'),
  ('disabled_player_ids', '[]')
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
    (SELECT NULLIF(trim(value), '') FROM public.app_settings WHERE key = 'contact_email'),
    'youth_u21_enabled',
    COALESCE(
      (SELECT value = 'true' FROM public.app_settings WHERE key = 'youth_u21_enabled'),
      true
    ),
    'youth_u18_enabled',
    COALESCE(
      (SELECT value = 'true' FROM public.app_settings WHERE key = 'youth_u18_enabled'),
      true
    ),
    'stats_page_enabled',
    COALESCE(
      (SELECT value = 'true' FROM public.app_settings WHERE key = 'stats_page_enabled'),
      true
    ),
    'disabled_player_ids',
    COALESCE(
      (SELECT value::jsonb FROM public.app_settings WHERE key = 'disabled_player_ids'),
      '[]'::jsonb
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.set_site_features(
  p_youth_u21_enabled boolean,
  p_youth_u18_enabled boolean,
  p_stats_page_enabled boolean,
  p_admin_secret text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  INSERT INTO public.app_settings (key, value) VALUES
    ('youth_u21_enabled', CASE WHEN p_youth_u21_enabled THEN 'true' ELSE 'false' END),
    ('youth_u18_enabled', CASE WHEN p_youth_u18_enabled THEN 'true' ELSE 'false' END),
    ('stats_page_enabled', CASE WHEN p_stats_page_enabled THEN 'true' ELSE 'false' END)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  RETURN public.get_contest_settings();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_site_features(boolean, boolean, boolean, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.set_site_features(boolean, boolean, boolean, text) FROM anon;

CREATE OR REPLACE FUNCTION public.set_disabled_player_ids(
  p_player_ids jsonb,
  p_admin_secret text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  IF p_player_ids IS NULL OR jsonb_typeof(p_player_ids) <> 'array' THEN
    RAISE EXCEPTION 'p_player_ids must be a JSON array';
  END IF;

  INSERT INTO public.app_settings (key, value)
  VALUES ('disabled_player_ids', p_player_ids::text)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  RETURN public.get_contest_settings();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_disabled_player_ids(jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.set_disabled_player_ids(jsonb, text) FROM anon;
