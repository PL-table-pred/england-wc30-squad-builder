-- England WC '30 Squad Builder — complete schema for TimeCapsule England'30 project
-- Project ref: nzypoiurjqvpohqmbide
-- Dashboard: https://supabase.com/dashboard/project/nzypoiurjqvpohqmbide

-- ---------------------------------------------------------------------------
-- Profiles (auth.users extension)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  display_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  audience_type text CHECK (audience_type IS NULL OR audience_type IN ('fan', 'journalist')),
  publication text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies on profiles are created after is_admin() below.

-- ---------------------------------------------------------------------------
-- App settings & reference squad (leaderboard answer key)
-- ---------------------------------------------------------------------------
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE public.reference_squad (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  squad_param text NOT NULL,
  label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value)
VALUES ('admin_secret', gen_random_uuid()::text)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_squad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reference squad"
  ON public.reference_squad FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "No direct write reference squad"
  ON public.reference_squad FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update reference squad"
  ON public.reference_squad FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "No read app settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (false);

-- ---------------------------------------------------------------------------
-- Community squad predictions (leaderboard)
-- ---------------------------------------------------------------------------
CREATE TABLE public.squad_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_param text NOT NULL UNIQUE,
  view_count integer NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  is_bot boolean NOT NULL DEFAULT false,
  bot_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX squad_predictions_view_count_idx
  ON public.squad_predictions (view_count DESC, created_at DESC);

CREATE INDEX squad_predictions_is_bot_idx
  ON public.squad_predictions (is_bot, created_at DESC);

ALTER TABLE public.squad_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON public.squad_predictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit squads"
  ON public.squad_predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(squad_param) <= 8192);

-- ---------------------------------------------------------------------------
-- Auth helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR auth.uid() = id);

CREATE OR REPLACE FUNCTION public.assert_admin_or_secret(p_admin_secret text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_secret text;
BEGIN
  IF public.is_admin() THEN
    RETURN;
  END IF;

  IF p_admin_secret IS NULL OR char_length(trim(p_admin_secret)) = 0 THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  IF stored_secret IS NULL OR p_admin_secret IS DISTINCT FROM stored_secret THEN
    RAISE EXCEPTION 'Invalid admin secret';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audience text;
  v_publication text;
BEGIN
  v_audience := NULLIF(trim(NEW.raw_user_meta_data->>'audience_type'), '');
  v_publication := NULLIF(trim(NEW.raw_user_meta_data->>'publication'), '');

  IF v_audience IS NOT NULL AND v_audience NOT IN ('fan', 'journalist') THEN
    v_audience := 'fan';
  END IF;

  IF v_audience = 'journalist' AND (v_publication IS NULL OR char_length(v_publication) < 2) THEN
    v_publication := NULL;
  END IF;

  IF v_audience = 'fan' THEN
    v_publication := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, audience_type, publication)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(v_audience, 'fan'),
    v_publication
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    audience_type = COALESCE(EXCLUDED.audience_type, profiles.audience_type),
    publication = COALESCE(EXCLUDED.publication, profiles.publication);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Leaderboard & contest RPCs
-- ---------------------------------------------------------------------------
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
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_contest_settings() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_contest_settings(
  p_submissions_locked boolean,
  p_admin_secret text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  INSERT INTO public.app_settings (key, value)
  VALUES ('submissions_locked', CASE WHEN p_submissions_locked THEN 'true' ELSE 'false' END)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  RETURN public.get_contest_settings();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_contest_settings(boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_squad_prediction(p_squad_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
  locked boolean;
BEGIN
  IF char_length(p_squad_param) < 1 OR char_length(p_squad_param) > 8192 THEN
    RAISE EXCEPTION 'Invalid squad_param length';
  END IF;

  SELECT COALESCE(
    (SELECT value = 'true' FROM public.app_settings WHERE key = 'submissions_locked'),
    false
  )
  INTO locked;

  IF locked THEN
    RAISE EXCEPTION 'Submissions are currently closed';
  END IF;

  INSERT INTO public.squad_predictions (squad_param)
  VALUES (p_squad_param)
  ON CONFLICT (squad_param) DO UPDATE SET squad_param = EXCLUDED.squad_param
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_squad_prediction(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_squad_views(p_squad_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.squad_predictions
  SET view_count = view_count + 1
  WHERE squad_param = p_squad_param;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_squad_views(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_reference_squad(
  p_squad_param text,
  p_admin_secret text DEFAULT NULL,
  p_label text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  IF char_length(p_squad_param) < 1 OR char_length(p_squad_param) > 8192 THEN
    RAISE EXCEPTION 'Invalid squad_param length';
  END IF;

  INSERT INTO public.reference_squad (id, squad_param, label, updated_at)
  VALUES (1, p_squad_param, p_label, now())
  ON CONFLICT (id) DO UPDATE SET
    squad_param = EXCLUDED.squad_param,
    label = EXCLUDED.label,
    updated_at = now();

  RETURN gen_random_uuid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_reference_squad(text, text, text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- QA bots (admin seeding)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_qa_bot_squads(
  p_admin_secret text,
  p_bots jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot jsonb;
  created_count int := 0;
  errors text[] := ARRAY[]::text[];
  new_id uuid;
  v_squad_param text;
  bot_name text;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  IF p_bots IS NULL OR jsonb_typeof(p_bots) <> 'array' THEN
    RAISE EXCEPTION 'p_bots must be a JSON array';
  END IF;

  IF jsonb_array_length(p_bots) > 50 THEN
    RAISE EXCEPTION 'Maximum 50 bots per request';
  END IF;

  FOR bot IN SELECT * FROM jsonb_array_elements(p_bots)
  LOOP
    v_squad_param := bot->>'squad_param';
    bot_name := bot->>'bot_name';

    IF v_squad_param IS NULL OR char_length(v_squad_param) < 1 OR char_length(v_squad_param) > 8192 THEN
      errors := array_append(errors, coalesce(bot_name, '?') || ': invalid squad_param');
      CONTINUE;
    END IF;

    IF bot_name IS NULL OR char_length(trim(bot_name)) < 1 THEN
      errors := array_append(errors, 'Missing bot_name');
      CONTINUE;
    END IF;

    BEGIN
      INSERT INTO public.squad_predictions (squad_param, is_bot, bot_name)
      VALUES (v_squad_param, true, trim(bot_name))
      ON CONFLICT (squad_param) DO NOTHING
      RETURNING id INTO new_id;

      IF new_id IS NOT NULL THEN
        created_count := created_count + 1;
      ELSE
        errors := array_append(errors, bot_name || ': duplicate squad');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      errors := array_append(errors, bot_name || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN jsonb_build_object('created', created_count, 'errors', to_jsonb(errors));
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_qa_bot_squads(text, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_all_qa_bots(p_admin_secret text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  DELETE FROM public.squad_predictions WHERE is_bot = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_all_qa_bots(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_qa_bot(p_id uuid, p_admin_secret text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  DELETE FROM public.squad_predictions WHERE id = p_id AND is_bot = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_qa_bot(uuid, text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin user management
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  role text,
  audience_type text,
  publication text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.role,
    p.audience_type,
    p.publication,
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_prediction(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.squad_predictions WHERE id = p_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_prediction(uuid) TO authenticated;
