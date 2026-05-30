CREATE OR REPLACE FUNCTION public.update_qa_bot(
  p_id uuid,
  p_squad_param text,
  p_bot_name text DEFAULT NULL,
  p_admin_secret text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trimmed_name text;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Bot id required';
  END IF;

  IF char_length(p_squad_param) < 1 OR char_length(p_squad_param) > 8192 THEN
    RAISE EXCEPTION 'Invalid squad_param length';
  END IF;

  trimmed_name := NULLIF(trim(p_bot_name), '');

  UPDATE public.squad_predictions
  SET
    squad_param = p_squad_param,
    bot_name = COALESCE(trimmed_name, bot_name)
  WHERE id = p_id AND is_bot = true;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_qa_bot(uuid, text, text, text) TO anon, authenticated;
