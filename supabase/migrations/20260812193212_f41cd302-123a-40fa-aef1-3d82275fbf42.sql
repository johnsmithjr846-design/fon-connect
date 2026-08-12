REVOKE EXECUTE ON FUNCTION public.admin_list_subscriptions(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_send_promotion(uuid, uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_subscriptions(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_send_promotion(uuid, uuid) TO service_role;