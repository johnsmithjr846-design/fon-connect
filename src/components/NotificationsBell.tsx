import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
};

export function NotificationsBell() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const notifications = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, link, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });

  if (!user) return null;

  const rows = notifications.data ?? [];
  const unread = rows.filter((n) => !n.read_at).length;

  async function markAllRead() {
    const ids = rows.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    await qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void markAllRead();
        }}
        className={`relative flex size-9 items-center justify-center rounded-full border transition-colors ${unread > 0 ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
      >
        <Bell className={`size-5 ${unread > 0 ? "animate-pulse" : ""}`} aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold ring-2 ring-background text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-1/2 top-32 z-30 w-80 max-w-[90vw] -translate-x-1/2 rounded-xl border-2 border-primary/40 bg-popover p-2 text-popover-foreground shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:translate-x-0">
          <p className="px-2 pb-2 pt-1 text-sm font-bold text-foreground">Notifications</p>
          {rows.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">Aucune notification.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {rows.map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link === "/tarifs" ? "/tarifs" : "/"}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
                  >
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-sm text-foreground/80">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
