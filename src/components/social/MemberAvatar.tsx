import { levelForXp } from "@/lib/lessons/gamification";

type Props = {
  pseudo: string | null;
  avatarUrl: string | null;
  size?: number;
};

export function initialsOf(pseudo: string | null) {
  const clean = (pseudo ?? "?").trim();
  return clean.slice(0, 2).toUpperCase() || "?";
}

export function MemberAvatar({ pseudo, avatarUrl, size = 40 }: Props) {
  const style = { width: size, height: size };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={pseudo ? `Photo de ${pseudo}` : "Photo de profil"}
        style={style}
        className="shrink-0 rounded-full border border-border object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span
      style={style}
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
    >
      {initialsOf(pseudo)}
    </span>
  );
}

export function MemberLine({
  pseudo,
  avatarUrl,
  xpTotal,
  lang,
}: {
  pseudo: string | null;
  avatarUrl: string | null;
  xpTotal: number;
  lang: string;
}) {
  const rank = levelForXp(xpTotal);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <MemberAvatar pseudo={pseudo} avatarUrl={avatarUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{pseudo ?? "Membre"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {lang === "en" ? "Level" : "Niveau"} {rank.level} · {lang === "en" ? rank.titleEn : rank.title} ·{" "}
          {xpTotal} XP
        </p>
      </div>
    </div>
  );
}
