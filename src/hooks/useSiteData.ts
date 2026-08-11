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
    contactEmail: query.data?.["contact_email"] || "contact@fonconnect.app",
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
};

export function useAds(placement: "home" | "lessons" | "translator") {
  return useQuery({
    queryKey: ["ads", placement],
    queryFn: async (): Promise<Ad[]> => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, body, image_url, link_url, placement")
        .in("placement", [placement, "all"]);
      if (error) throw error;
      return (data ?? []) as Ad[];
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
