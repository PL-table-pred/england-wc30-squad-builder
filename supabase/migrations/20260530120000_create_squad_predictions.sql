-- Community leaderboard for shared squad predictions
-- Applied via Supabase MCP; kept here for reference.

CREATE TABLE IF NOT EXISTS public.squad_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_param text NOT NULL UNIQUE,
  view_count integer NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS squad_predictions_view_count_idx
  ON public.squad_predictions (view_count DESC, created_at DESC);

ALTER TABLE public.squad_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON public.squad_predictions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can submit squads"
  ON public.squad_predictions FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(squad_param) <= 8192);

CREATE OR REPLACE FUNCTION public.submit_squad_prediction(p_squad_param text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_id uuid;
BEGIN
  INSERT INTO public.squad_predictions (squad_param) VALUES (p_squad_param)
  ON CONFLICT (squad_param) DO UPDATE SET squad_param = EXCLUDED.squad_param
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_squad_views(p_squad_param text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.squad_predictions SET view_count = view_count + 1
  WHERE squad_param = p_squad_param;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_squad_prediction(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_squad_views(text) TO anon, authenticated;
