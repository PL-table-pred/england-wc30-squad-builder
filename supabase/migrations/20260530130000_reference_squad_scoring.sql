-- Reference squad for accuracy-based leaderboard scoring

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reference_squad (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  squad_param text NOT NULL,
  label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed admin secret (rotate via: UPDATE app_settings SET value = 'new-uuid' WHERE key = 'admin_secret')
INSERT INTO public.app_settings (key, value)
VALUES ('admin_secret', gen_random_uuid()::text)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.reference_squad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reference squad" ON public.reference_squad;
CREATE POLICY "Anyone can read reference squad"
  ON public.reference_squad FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "No direct write reference squad" ON public.reference_squad;
CREATE POLICY "No direct write reference squad"
  ON public.reference_squad FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "No direct update reference squad" ON public.reference_squad;
CREATE POLICY "No direct update reference squad"
  ON public.reference_squad FOR UPDATE
  TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "No read app settings" ON public.app_settings;
CREATE POLICY "No read app settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE OR REPLACE FUNCTION public.set_reference_squad(
  p_squad_param text,
  p_admin_secret text,
  p_label text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_secret text;
BEGIN
  IF char_length(p_squad_param) < 1 OR char_length(p_squad_param) > 8192 THEN
    RAISE EXCEPTION 'Invalid squad_param length';
  END IF;

  SELECT value INTO stored_secret
  FROM public.app_settings
  WHERE key = 'admin_secret';

  IF stored_secret IS NULL OR p_admin_secret IS DISTINCT FROM stored_secret THEN
    RAISE EXCEPTION 'Invalid admin secret';
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

REVOKE ALL ON FUNCTION public.set_reference_squad(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_reference_squad(text, text, text) TO anon, authenticated;
