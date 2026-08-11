import { useAds } from "@/hooks/useSiteData";

export function AdSlot({ placement }: { placement: "home" | "lessons" | "translator" }) {
  const { data } = useAds(placement);
  const ads = data ?? [];
  if (ads.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      {ads.map((ad) => {
        const content = (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.title}
                loading="lazy"
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Annonce
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-card-foreground">
                {ad.title}
              </p>
              {ad.body && <p className="mt-0.5 text-sm text-muted-foreground">{ad.body}</p>}
            </div>
          </div>
        );

        return ad.link_url ? (
          <a
            key={ad.id}
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block transition-opacity hover:opacity-90"
          >
            {content}
          </a>
        ) : (
          <div key={ad.id}>{content}</div>
        );
      })}
    </div>
  );
}
