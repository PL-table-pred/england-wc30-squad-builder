-- Admin-managed blog posts for England WC '30 Squad Builder.

INSERT INTO public.app_settings (key, value)
VALUES ('blog_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  author_label text,
  cover_image_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT blog_posts_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT blog_posts_body_length CHECK (char_length(body) <= 50000)
);

CREATE INDEX blog_posts_published_idx
  ON public.blog_posts (published, published_at DESC NULLS LAST);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct blog access"
  ON public.blog_posts
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

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
    'blog_enabled',
    COALESCE(
      (SELECT value = 'true' FROM public.app_settings WHERE key = 'blog_enabled'),
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
  p_blog_enabled boolean,
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
    ('stats_page_enabled', CASE WHEN p_stats_page_enabled THEN 'true' ELSE 'false' END),
    ('blog_enabled', CASE WHEN p_blog_enabled THEN 'true' ELSE 'false' END)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  RETURN public.get_contest_settings();
END;
$$;

CREATE OR REPLACE FUNCTION public.list_published_blog_posts(p_limit integer DEFAULT 20)
RETURNS SETOF public.blog_posts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.blog_posts
  WHERE published = true
  ORDER BY published_at DESC NULLS LAST, created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 50);
$$;

GRANT EXECUTE ON FUNCTION public.list_published_blog_posts(integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_published_blog_post(p_slug text)
RETURNS public.blog_posts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.blog_posts
  WHERE slug = trim(p_slug)
    AND published = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_blog_post(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_blog_posts(p_admin_secret text DEFAULT NULL)
RETURNS SETOF public.blog_posts
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);
  RETURN QUERY
  SELECT *
  FROM public.blog_posts
  ORDER BY updated_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_blog_posts(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_list_blog_posts(text) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_upsert_blog_post(
  p_id uuid,
  p_slug text,
  p_title text,
  p_excerpt text,
  p_body text,
  p_author_label text,
  p_cover_image_url text,
  p_published boolean,
  p_admin_secret text DEFAULT NULL
)
RETURNS public.blog_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text;
  v_row public.blog_posts;
  v_was_published boolean;
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);

  v_slug := lower(trim(COALESCE(p_slug, '')));
  IF v_slug = '' OR v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid slug (use lowercase letters, numbers, and hyphens)';
  END IF;

  IF char_length(trim(COALESCE(p_title, ''))) < 1 THEN
    RAISE EXCEPTION 'Title is required';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.blog_posts (
      slug, title, excerpt, body, author_label, cover_image_url, published, published_at
    ) VALUES (
      v_slug,
      trim(p_title),
      COALESCE(p_excerpt, ''),
      COALESCE(p_body, ''),
      NULLIF(trim(COALESCE(p_author_label, '')), ''),
      NULLIF(trim(COALESCE(p_cover_image_url, '')), ''),
      COALESCE(p_published, false),
      CASE WHEN COALESCE(p_published, false) THEN now() ELSE NULL END
    )
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  SELECT published INTO v_was_published FROM public.blog_posts WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  UPDATE public.blog_posts SET
    slug = v_slug,
    title = trim(p_title),
    excerpt = COALESCE(p_excerpt, ''),
    body = COALESCE(p_body, ''),
    author_label = NULLIF(trim(COALESCE(p_author_label, '')), ''),
    cover_image_url = NULLIF(trim(COALESCE(p_cover_image_url, '')), ''),
    published = COALESCE(p_published, false),
    published_at = CASE
      WHEN COALESCE(p_published, false) AND published_at IS NULL THEN now()
      WHEN NOT COALESCE(p_published, false) THEN NULL
      ELSE published_at
    END,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_blog_post(uuid, text, text, text, text, text, text, boolean, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_blog_post(uuid, text, text, text, text, text, text, boolean, text) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_delete_blog_post(
  p_id uuid,
  p_admin_secret text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin_or_secret(p_admin_secret);
  DELETE FROM public.blog_posts WHERE id = p_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_blog_post(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_blog_post(uuid, text) FROM anon;
