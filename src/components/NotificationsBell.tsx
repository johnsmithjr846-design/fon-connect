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
        className="relative text-muted-foreground transition-colors hover:text-primary"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-border bg-card p-2 shadow-lg">
          {rows.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">Aucune notification.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {rows.map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link === "/tarifs" ? "/tarifs" : "/"}
                    onClick={() => setOpen(false)}
                    className="block rounded-md p-2 text-left transition-colors hover:bg-secondary"
                  >
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
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
