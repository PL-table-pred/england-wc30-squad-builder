-- QA bot predictions for leaderboard seeding (mirrors pl-table-predict bot maker)

ALTER TABLE public.squad_predictions
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bot_name text;

CREATE INDEX IF NOT EXISTS squad_predictions_is_bot_idx
  ON public.squad_predictions (is_bot, created_at DESC);

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
  stored_secret text;
  bot jsonb;
  created_count int := 0;
  errors text[] := ARRAY[]::text[];
  new_id uuid;
  squad_param text;
  bot_name text;
BEGIN
  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  IF stored_secret IS NULL OR p_admin_secret IS DISTINCT FROM stored_secret THEN
    RAISE EXCEPTION 'Invalid admin secret';
  END IF;

  IF p_bots IS NULL OR jsonb_typeof(p_bots) <> 'array' THEN
    RAISE EXCEPTION 'p_bots must be a JSON array';
  END IF;

  IF jsonb_array_length(p_bots) > 50 THEN
    RAISE EXCEPTION 'Maximum 50 bots per request';
  END IF;

  FOR bot IN SELECT * FROM jsonb_array_elements(p_bots)
  LOOP
    squad_param := bot->>'squad_param';
    bot_name := bot->>'bot_name';

    IF squad_param IS NULL OR char_length(squad_param) < 1 OR char_length(squad_param) > 8192 THEN
      errors := array_append(errors, coalesce(bot_name, '?') || ': invalid squad_param');
      CONTINUE;
    END IF;

    IF bot_name IS NULL OR char_length(trim(bot_name)) < 1 THEN
      errors := array_append(errors, 'Missing bot_name');
      CONTINUE;
    END IF;

    BEGIN
      INSERT INTO public.squad_predictions (squad_param, is_bot, bot_name)
      VALUES (squad_param, true, trim(bot_name))
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

CREATE OR REPLACE FUNCTION public.delete_all_qa_bots(p_admin_secret text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_secret text;
  deleted_count integer;
BEGIN
  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  IF stored_secret IS NULL OR p_admin_secret IS DISTINCT FROM stored_secret THEN
    RAISE EXCEPTION 'Invalid admin secret';
  END IF;

  DELETE FROM public.squad_predictions WHERE is_bot = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_qa_bot(p_id uuid, p_admin_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_secret text;
  deleted_count integer;
BEGIN
  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  IF stored_secret IS NULL OR p_admin_secret IS DISTINCT FROM stored_secret THEN
    RAISE EXCEPTION 'Invalid admin secret';
  END IF;

  DELETE FROM public.squad_predictions WHERE id = p_id AND is_bot = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_qa_bot_squads(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_all_qa_bots(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_qa_bot(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.seed_qa_bot_squads(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_qa_bots(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_qa_bot(uuid, text) TO anon, authenticated;
