import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PublicMember = {
  userId: string;
  pseudo: string | null;
  avatarUrl: string | null;
  xpTotal: number;
};

export type SearchResult = PublicMember & {
  friendStatus: "none" | "sent" | "received" | "friends";
};

export type FriendshipRow = PublicMember & {
  friendshipId: string;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  createdAt: string;
};

export type Conversation = PublicMember & {
  lastBody: string;
  lastAt: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
};

export const searchMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ q: z.string().trim().min(2).max(40) }).parse(input))
  .handler(async ({ data, context }): Promise<SearchResult[]> => {
    const { data: rows, error } = await context.supabase.rpc("search_profiles", { _q: data.q });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      userId: r.user_id,
      pseudo: r.pseudo,
      avatarUrl: r.avatar_url,
      xpTotal: r.xp_total ?? 0,
      friendStatus: (r.friend_status ?? "none") as SearchResult["friendStatus"],
    }));
  });

export const listFriendships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FriendshipRow[]> => {
    const { data, error } = await context.supabase.rpc("list_friendships");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      friendshipId: r.friendship_id,
      userId: r.user_id,
      pseudo: r.pseudo,
      avatarUrl: r.avatar_url,
      xpTotal: r.xp_total ?? 0,
      status: r.status as FriendshipRow["status"],
      direction: r.direction as FriendshipRow["direction"],
      createdAt: r.created_at,
    }));
  });

export const sendFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("invalid");
    const { data: existing } = await context.supabase
      .from("friendships")
      .select("id")
      .eq("requester_id", data.userId)
      .eq("addressee_id", context.userId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, accepted: true };
    }
    const { error } = await context.supabase
      .from("friendships")
      .insert({ requester_id: context.userId, addressee_id: data.userId, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true, accepted: false };
  });

export const respondFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ friendshipId: z.string().uuid(), accept: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.accept) {
      const { error } = await context.supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", data.friendshipId);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("friendships").delete().eq("id", data.friendshipId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeFriend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ friendshipId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("friendships").delete().eq("id", data.friendshipId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Conversation[]> => {
    const { data, error } = await context.supabase.rpc("list_conversations");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      userId: r.user_id,
      pseudo: r.pseudo,
      avatarUrl: r.avatar_url,
      xpTotal: r.xp_total ?? 0,
      lastBody: r.last_body ?? "",
      lastAt: r.last_at,
      unread: r.unread ?? 0,
    }));
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ peerId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ peer: PublicMember | null; messages: ChatMessage[] }> => {
    const { data: peerRows, error: peerError } = await context.supabase.rpc("get_public_profile", {
      _target: data.peerId,
    });
    if (peerError) throw new Error(peerError.message);
    const peerRow = peerRows?.[0];

    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(
        `and(sender_id.eq.${context.userId},recipient_id.eq.${data.peerId}),and(sender_id.eq.${data.peerId},recipient_id.eq.${context.userId})`,
      )
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);

    await context.supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", context.userId)
      .eq("sender_id", data.peerId)
      .is("read_at", null);

    return {
      peer: peerRow
        ? {
            userId: peerRow.user_id,
            pseudo: peerRow.pseudo,
            avatarUrl: peerRow.avatar_url,
            xpTotal: peerRow.xp_total ?? 0,
          }
        : null,
      messages: (rows ?? []).map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        recipientId: m.recipient_id,
        body: m.body,
        createdAt: m.created_at,
      })),
    };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ peerId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("messages")
      .insert({ sender_id: context.userId, recipient_id: data.peerId, body: data.body });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
