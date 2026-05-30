-- Fix ambiguous squad_param in seed_qa_bot_squads (variable vs column name).
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
