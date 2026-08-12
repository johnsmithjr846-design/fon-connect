import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getEntitlements } from "@/lib/entitlements.functions";
import { FREE_ENTITLEMENTS, type Entitlements } from "@/lib/billing/entitlements";
import { useAuthUser } from "@/hooks/useAuthUser";

/** Affichage uniquement : les droits font foi côté serveur. */
export function useEntitlements() {
  const { user, loading } = useAuthUser();
  const fetchEntitlements = useServerFn(getEntitlements);

  const query = useQuery({
    queryKey: ["entitlements", user?.id],
    queryFn: () => fetchEntitlements(),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const entitlements: Entitlements = query.data ?? FREE_ENTITLEMENTS;
  return { user, authLoading: loading, entitlements, isLoading: query.isLoading, refetch: query.refetch };
}
