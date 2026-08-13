import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberLine } from "@/components/social/MemberAvatar";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  listFriendships,
  removeFriend,
  respondFriendRequest,
  searchMembers,
  sendFriendRequest,
} from "@/lib/social.functions";

export const Route = createFileRoute("/amis")({
  component: FriendsPage,
  head: () => ({
    meta: [
      { title: "Mes amis — communauté FonConnect" },
      {
        name: "description",
        content:
          "Recherchez d'autres apprenants du fon, envoyez des demandes d'amis et échangez avec la communauté FonConnect.",
      },
      { property: "og:title", content: "Mes amis — FonConnect" },
      {
        property: "og:description",
        content: "Trouvez des apprenants du fon et ajoutez-les en amis pour discuter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/amis" }],
  }),
});

function FriendsPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuthUser();

  const doSearch = useServerFn(searchMembers);
  const doList = useServerFn(listFriendships);
  const doAdd = useServerFn(sendFriendRequest);
  const doRespond = useServerFn(respondFriendRequest);
  const doRemove = useServerFn(removeFriend);

  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const friendsQuery = useQuery({
    queryKey: ["friendships", user?.id],
    queryFn: () => doList(),
    enabled: Boolean(user),
  });

  const searchQuery = useQuery({
    queryKey: ["member-search", submitted],
    queryFn: () => doSearch({ data: { q: submitted } }),
    enabled: submitted.trim().length >= 2,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["friendships", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["member-search"] });
  }

  const addMutation = useMutation({
    mutationFn: (userId: string) => doAdd({ data: { userId } }),
    onSuccess: refresh,
  });
  const respondMutation = useMutation({
    mutationFn: (vars: { friendshipId: string; accept: boolean }) => doRespond({ data: vars }),
    onSuccess: refresh,
  });
  const removeMutation = useMutation({
    mutationFn: (friendshipId: string) => doRemove({ data: { friendshipId } }),
    onSuccess: refresh,
  });

  const rows = friendsQuery.data ?? [];
  const incoming = rows.filter((r) => r.status === "pending" && r.direction === "incoming");
  const outgoing = rows.filter((r) => r.status === "pending" && r.direction === "outgoing");
  const friends = rows.filter((r) => r.status === "accepted");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {en ? "Friends" : "Mes amis"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {en
            ? "Only nicknames, avatars and levels are visible. Email addresses are never shared."
            : "Seuls les pseudos, photos et niveaux sont visibles. Les adresses e-mail ne sont jamais partagées."}
        </p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query.trim());
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={en ? "Search by nickname…" : "Rechercher un pseudo…"}
            aria-label={en ? "Search members" : "Rechercher des membres"}
          />
          <Button type="submit">{en ? "Search" : "Rechercher"}</Button>
        </form>

        {submitted.length >= 2 && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {en ? "Results" : "Résultats"}
            </h2>
            {searchQuery.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">{en ? "Loading…" : "Chargement…"}</p>
            ) : (searchQuery.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {en ? "No member found." : "Aucun membre trouvé."}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {(searchQuery.data ?? []).map((m) => (
                  <li
                    key={m.userId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <MemberLine {...m} lang={lang} />
                    {m.friendStatus === "friends" ? (
                      <Link
                        to="/messages"
                        search={{ peer: m.userId }}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {en ? "Message" : "Écrire"}
                      </Link>
                    ) : m.friendStatus === "sent" ? (
                      <span className="text-xs text-muted-foreground">{en ? "Pending" : "En attente"}</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={m.friendStatus === "received" ? "default" : "outline"}
                        disabled={addMutation.isPending}
                        onClick={() => addMutation.mutate(m.userId)}
                      >
                        {m.friendStatus === "received"
                          ? en
                            ? "Accept"
                            : "Accepter"
                          : en
                            ? "Add"
                            : "Ajouter"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {incoming.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {en ? "Requests received" : "Demandes reçues"}
            </h2>
            <ul className="mt-3 space-y-2">
              {incoming.map((r) => (
                <li
                  key={r.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <MemberLine {...r} lang={lang} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        respondMutation.mutate({ friendshipId: r.friendshipId, accept: true })
                      }
                    >
                      {en ? "Accept" : "Accepter"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        respondMutation.mutate({ friendshipId: r.friendshipId, accept: false })
                      }
                    >
                      {en ? "Decline" : "Refuser"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {outgoing.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {en ? "Requests sent" : "Demandes envoyées"}
            </h2>
            <ul className="mt-3 space-y-2">
              {outgoing.map((r) => (
                <li
                  key={r.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <MemberLine {...r} lang={lang} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeMutation.mutate(r.friendshipId)}
                  >
                    {en ? "Cancel" : "Annuler"}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {en ? "My friends" : "Mes amis"}
          </h2>
          {friendsQuery.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{en ? "Loading…" : "Chargement…"}</p>
          ) : friends.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {en
                ? "No friends yet. Search for a nickname above."
                : "Pas encore d'amis. Recherchez un pseudo ci-dessus."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {friends.map((r) => (
                <li
                  key={r.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <MemberLine {...r} lang={lang} />
                  <div className="flex items-center gap-3">
                    <Link
                      to="/messages"
                      search={{ peer: r.userId }}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {en ? "Message" : "Écrire"}
                    </Link>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                      onClick={() => removeMutation.mutate(r.friendshipId)}
                    >
                      {en ? "Remove" : "Retirer"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
