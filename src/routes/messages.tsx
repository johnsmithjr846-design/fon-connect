import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberLine } from "@/components/social/MemberAvatar";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getThread, listConversations, listFriendships, sendMessage } from "@/lib/social.functions";

type MessagesSearch = { peer?: string };

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    peer: typeof search['peer'] === "string" ? (search['peer'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages privés — communauté FonConnect" },
      {
        name: "description",
        content:
          "Discutez en privé avec vos amis apprenants du fon sur FonConnect, sans partager votre adresse e-mail.",
      },
      { property: "og:title", content: "Messages privés — FonConnect" },
      {
        property: "og:description",
        content: "Échangez avec vos amis apprenants du fon directement sur FonConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/messages" }],
  }),
});

function MessagesPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuthUser();
  const { peer } = Route.useSearch();

  const doConversations = useServerFn(listConversations);
  const doFriends = useServerFn(listFriendships);
  const doThread = useServerFn(getThread);
  const doSend = useServerFn(sendMessage);

  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const conversationsQuery = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => doConversations(),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });

  const friendsQuery = useQuery({
    queryKey: ["friendships", user?.id],
    queryFn: () => doFriends(),
    enabled: Boolean(user),
  });

  const threadQuery = useQuery({
    queryKey: ["thread", peer],
    queryFn: () => doThread({ data: { peerId: peer as string } }),
    enabled: Boolean(user && peer),
    refetchInterval: 8000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [threadQuery.data?.messages.length]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => doSend({ data: { peerId: peer as string, body } }),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["thread", peer] });
      await queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
  });

  const friends = (friendsQuery.data ?? []).filter((f) => f.status === "accepted");
  const conversations = conversationsQuery.data ?? [];
  const known = new Set(conversations.map((c) => c.userId));
  const otherFriends = friends.filter((f) => !known.has(f.userId));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {en
            ? "Private chats with your friends. Nicknames and levels only — no email addresses."
            : "Discussions privées avec vos amis. Pseudos et niveaux uniquement — jamais les e-mails."}
        </p>

        {peer ? (
          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              {threadQuery.data?.peer ? (
                <MemberLine
                  pseudo={threadQuery.data.peer.pseudo}
                  avatarUrl={threadQuery.data.peer.avatarUrl}
                  xpTotal={threadQuery.data.peer.xpTotal}
                  lang={lang}
                />
              ) : (
                <span className="text-sm text-muted-foreground">{en ? "Loading…" : "Chargement…"}</span>
              )}
              <Link
                to="/messages"
                search={{}}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {en ? "All chats" : "Toutes les discussions"}
              </Link>
            </div>

            <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-3">
              {(threadQuery.data?.messages ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {en ? "No message yet. Say hello!" : "Aucun message. Dites bonjour !"}
                </p>
              ) : (
                (threadQuery.data?.messages ?? []).map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                      <p
                        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {m.body}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const body = draft.trim();
                if (body) sendMutation.mutate(body);
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={en ? "Write a message…" : "Écrire un message…"}
                aria-label={en ? "Message" : "Message"}
                maxLength={2000}
              />
              <Button type="submit" disabled={sendMutation.isPending || draft.trim().length === 0}>
                {en ? "Send" : "Envoyer"}
              </Button>
            </form>
            {sendMutation.isError && (
              <p className="mt-2 text-sm text-destructive">
                {en ? "Message not sent." : "Message non envoyé."}
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {en ? "Conversations" : "Discussions"}
              </h2>
              {conversationsQuery.isLoading ? (
                <p className="mt-3 text-sm text-muted-foreground">{en ? "Loading…" : "Chargement…"}</p>
              ) : conversations.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {en ? "No conversation yet." : "Aucune discussion pour le moment."}
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {conversations.map((c) => (
                    <li key={c.userId}>
                      <Link
                        to="/messages"
                        search={{ peer: c.userId }}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary"
                      >
                        <MemberLine
                          pseudo={c.pseudo}
                          avatarUrl={c.avatarUrl}
                          xpTotal={c.xpTotal}
                          lang={lang}
                        />
                        <span className="flex items-center gap-2">
                          <span className="max-w-[8rem] truncate text-xs text-muted-foreground">
                            {c.lastBody}
                          </span>
                          {c.unread > 0 && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                              {c.unread}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {en ? "Start a chat" : "Démarrer une discussion"}
              </h2>
              {otherFriends.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {en ? "Add friends to start chatting. " : "Ajoutez des amis pour discuter. "}
                  <Link to="/amis" className="text-primary underline-offset-4 hover:underline">
                    {en ? "Find members" : "Trouver des membres"}
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {otherFriends.map((f) => (
                    <li key={f.friendshipId}>
                      <Link
                        to="/messages"
                        search={{ peer: f.userId }}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary"
                      >
                        <MemberLine
                          pseudo={f.pseudo}
                          avatarUrl={f.avatarUrl}
                          xpTotal={f.xpTotal}
                          lang={lang}
                        />
                        <span className="text-xs font-medium text-primary">
                          {en ? "Message" : "Écrire"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
