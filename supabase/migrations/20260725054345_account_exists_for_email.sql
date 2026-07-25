-- Allow login/signup UX to distinguish missing accounts vs wrong password.
-- Intentionally reveals whether an email is registered (email enumeration).

CREATE OR REPLACE FUNCTION public.account_exists_for_email(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE lower(u.email) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.account_exists_for_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_exists_for_email(text) TO anon, authenticated;
