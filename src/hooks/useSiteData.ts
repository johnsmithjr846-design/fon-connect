import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView } from "@/lib/analytics.functions";

export type SiteSettings = Record<string, string>;

export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: SiteSettings = {};
      for (const row of data ?? []) map[row.key] = row.value;
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    settings: query.data ?? {},
    contactEmail: query.data?.["contact_email"] || "fonconnect@outlook.fr",
    companyName: query.data?.["company_name"] || "FonConnect",
    announcement: query.data?.["announcement"] ?? "",
  };
}

export type AppRelease = {
  id: string;
  platform: string;
  version: string;
  download_url: string;
  notes: string;
  size_label: string;
  published: boolean;
  released_at: string;
};

export function usePublishedReleases() {
  return useQuery({
    queryKey: ["app-releases", "published"],
    queryFn: async (): Promise<AppRelease[]> => {
      const { data, error } = await supabase
        .from("app_releases")
        .select("id, platform, version, download_url, notes, size_label, published, released_at")
        .eq("published", true)
        .order("released_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AppRelease[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type Ad = {
  id: string;
  title: string;
  body: string;
  image_url: string;
  link_url: string;
  placement: string;
  media_type: string;
  media_path: string | null;
  show_after_questions: boolean;
  question_interval: number;
  show_on_hearts_empty: boolean;
  max_per_lesson: number;
  reward_heart: boolean;
};

const AD_COLUMNS =
  "id, title, body, image_url, link_url, placement, media_type, media_path, show_after_questions, question_interval, show_on_hearts_empty, max_per_lesson, reward_heart";

/** Remplace image_url par une adresse signée quand le média est stocké dans le site. */
export async function resolveAdMedia<T extends { media_path: string | null; image_url: string }>(
  rows: T[],
): Promise<T[]> {
  const paths = rows.map((r) => r.media_path).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return rows;
  const { data } = await supabase.storage.from("ad-media").createSignedUrls(paths, 60 * 60 * 24);
  const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return rows.map((r) =>
    r.media_path && map.get(r.media_path) ? { ...r, image_url: map.get(r.media_path)! } : r,
  );
}

export function useAds(placement: "home" | "lessons" | "translator") {
  return useQuery({
    queryKey: ["ads", placement],
    queryFn: async (): Promise<Ad[]> => {
      const { data, error } = await supabase
        .from("ads")
        .select(AD_COLUMNS)
        .eq("active", true)
        .in("placement", [placement, "all"]);
      if (error) throw error;
      return resolveAdMedia((data ?? []) as Ad[]);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Annonces actives configurées pour s'afficher pendant les leçons. */
export function useLessonAds(enabled: boolean) {
  return useQuery({
    queryKey: ["ads", "lesson-interstitial"],
    enabled,
    queryFn: async (): Promise<Ad[]> => {
      const { data, error } = await supabase
        .from("ads")
        .select(AD_COLUMNS)
        .eq("active", true)
        .or("show_after_questions.eq.true,show_on_hearts_empty.eq.true");
      if (error) throw error;
      return resolveAdMedia((data ?? []) as Ad[]);
    },
    staleTime: 5 * 60 * 1000,
  });
}

const VISITOR_KEY = "fonconnect:visitor";

export function usePageView(path: string) {
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(VISITOR_KEY) === "1";
      if (!seen) localStorage.setItem(VISITOR_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    void trackPageView({ data: { path, newVisitor: !seen } }).catch(() => {});
  }, [path]);
}
