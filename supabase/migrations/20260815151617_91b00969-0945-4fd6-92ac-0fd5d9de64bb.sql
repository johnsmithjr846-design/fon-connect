REVOKE EXECUTE ON FUNCTION public.search_profiles(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_friendships() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_conversations() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_friendships() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_conversations() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, service_role;