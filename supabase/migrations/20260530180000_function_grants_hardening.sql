-- Restrict RPC execute permissions (admin RPCs: authenticated only)

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assert_admin_or_secret(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

REVOKE EXECUTE ON FUNCTION public.admin_list_profiles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_prediction(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_contest_settings(boolean, text) FROM anon;
