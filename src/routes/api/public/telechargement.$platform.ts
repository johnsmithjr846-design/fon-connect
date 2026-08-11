import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telechargement/$platform")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const platform = params.platform === "ios" ? "ios" : "android";
        const id = new URL(request.url).searchParams.get("id");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let query = supabaseAdmin
          .from("app_releases")
          .select("download_url")
          .eq("platform", platform)
          .eq("published", true);
        if (id) query = query.eq("id", id);

        const { data, error } = await query
          .order("released_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data?.download_url) {
          return new Response("Aucune version disponible pour cette plateforme.", { status: 404 });
        }

        const url = data.download_url;
        if (url.startsWith("storage:")) {
          const objectPath = url.slice("storage:".length);
          const signed = await supabaseAdmin.storage
            .from("app-downloads")
            .createSignedUrl(objectPath, 300, { download: true });
          if (signed.error || !signed.data?.signedUrl) {
            return new Response("Fichier introuvable.", { status: 404 });
          }
          return Response.redirect(signed.data.signedUrl, 302);
        }

        return Response.redirect(url, 302);
      },
    },
  },
});
