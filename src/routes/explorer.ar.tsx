import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ArrowUp, Loader2, Lock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getArAccess, getRoute } from "@/lib/explore.functions";
import { formatDistance, type RoutePlan, type TravelMode } from "@/lib/explore/categories";

const SearchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().default(""),
  mode: z.enum(["DRIVE", "WALK", "TWO_WHEELER", "TRANSIT"]).default("WALK"),
});

export const Route = createFileRoute("/explorer/ar")({
  validateSearch: (search: Record<string, unknown>) => SearchSchema.parse(search),
  component: ArPage,
  head: () => ({
    meta: [
      { title: "Navigation AR — Explorer le Bénin | FonConnect" },
      {
        name: "description",
        content:
          "Navigation en réalité augmentée FonConnect : la caméra affiche les flèches, la distance et les instructions vocales jusqu'à votre destination.",
      },
      { property: "og:title", content: "Navigation AR FonConnect" },
      {
        property: "og:description",
        content: "Suivez vos itinéraires au Bénin en réalité augmentée avec la caméra du téléphone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function bearingTo(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function ArPage() {
  const { lat, lng, name, mode } = Route.useSearch();
  const { lang } = useI18n();
  const speech = useSpeech();
  const fetchAccess = useServerFn(getArAccess);
  const fetchRoute = useServerFn(getRoute);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const spokenRef = useRef<string | null>(null);

  const [access, setAccess] = useState<"loading" | "allowed" | "denied">("loading");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [route, setRoute] = useState<RoutePlan | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAccess()
      .then((result) => active && setAccess(result.allowed ? "allowed" : "denied"))
      .catch(() => active && setAccess("denied"));
    return () => {
      active = false;
    };
  }, [fetchAccess]);

  useEffect(() => {
    if (access !== "allowed") return;
    let active = true;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      })
      .catch(() =>
        setCameraError(
          lang === "en"
            ? "Camera unavailable: AR preview only. Use the FonConnect mobile app for full AR."
            : "Caméra indisponible : aperçu AR seulement. Utilisez l'application mobile FonConnect pour l'AR complète.",
        ),
      );

    const watchId = navigator.geolocation?.watchPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () =>
        setError(
          lang === "en" ? "Location permission denied." : "Autorisation de localisation refusée.",
        ),
      { enableHighAccuracy: true },
    );

    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkit = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading;
      if (typeof webkit === "number") setHeading(webkit);
      else if (typeof event.alpha === "number") setHeading(360 - event.alpha);
    };
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener);
    window.addEventListener("deviceorientation", onOrientation as EventListener);

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (watchId !== undefined) navigator.geolocation?.clearWatch(watchId);
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener);
      window.removeEventListener("deviceorientation", onOrientation as EventListener);
      speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, lang]);

  useEffect(() => {
    if (access !== "allowed" || !position || route) return;
    let active = true;
    void fetchRoute({
      data: {
        origin: position,
        destination: { lat, lng },
        travelMode: mode as TravelMode,
      },
    }).then((response) => {
      if (!active) return;
      setRoute(response.route);
      setError(response.error);
    });
    return () => {
      active = false;
    };
  }, [access, position, route, lat, lng, mode, fetchRoute]);

  const step = route?.steps[stepIndex] ?? null;
  const stepTarget = step ? { lat: step.endLat, lng: step.endLng } : { lat, lng };
  const remaining = position ? distanceMeters(position, stepTarget) : null;
  const bearing = position ? bearingTo(position, stepTarget) : null;
  const rotation = bearing === null ? 0 : bearing - (heading ?? 0);

  useEffect(() => {
    if (remaining !== null && remaining < 25 && route && stepIndex < route.steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  }, [remaining, route, stepIndex]);

  useEffect(() => {
    if (!step || spokenRef.current === `${stepIndex}`) return;
    spokenRef.current = `${stepIndex}`;
    void speech.speak(
      `ar-${stepIndex}`,
      `${step.instruction}, ${formatDistance(step.distanceMeters, lang)}`,
      lang,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, step]);

  if (access === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl justify-center px-5 py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Lock className="mx-auto size-6 text-muted-foreground" />
            <h1 className="mt-3 text-lg font-semibold text-foreground">
              🧭 {lang === "en" ? "AR navigation" : "Navigation AR"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "en"
                ? "AR navigation is available with the Travel passes, Traduc Premium and Premium GOLD offers."
                : "🧭 La navigation AR est disponible avec les offres Voyage, Traduc Premium et Premium GOLD."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                to="/tarifs"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {lang === "en" ? "See the offers" : "Voir les offres"}
              </Link>
              <Link
                to="/explorer"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                {lang === "en" ? "Back to the map" : "Retour à la carte"}
              </Link>
            </div>
            <div className="mt-6 aspect-video w-full rounded-lg bg-gradient-to-br from-primary/20 via-[var(--brand-yellow)]/20 to-destructive/20" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-6">
        <h1 className="text-xl font-bold text-foreground">
          🧭 {lang === "en" ? "AR navigation" : "Navigation AR"} — {name}
        </h1>

        <div className="relative mt-4 aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-black sm:aspect-video">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
            aria-label={lang === "en" ? "Camera view" : "Vue caméra"}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4">
            <div className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              🏁 {name}
              {remaining !== null ? ` — ${formatDistance(remaining, lang)}` : ""}
            </div>
            <ArrowUp
              className="size-24 text-white drop-shadow-lg transition-transform"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="w-full rounded-lg bg-black/60 p-3 text-center text-sm text-white">
              {step
                ? `${step.instruction} — ${formatDistance(step.distanceMeters, lang)}`
                : lang === "en"
                  ? "Calculating the route…"
                  : "Calcul de l'itinéraire…"}
            </div>
          </div>
        </div>

        {cameraError && <p className="mt-3 text-sm text-muted-foreground">{cameraError}</p>}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {heading === null && (
          <p className="mt-2 text-xs text-muted-foreground">
            {lang === "en"
              ? "Compass unavailable on this device: the arrow points to the geographic bearing."
              : "Boussole indisponible sur cet appareil : la flèche indique le cap géographique."}
          </p>
        )}

        {route && (
          <ol className="mt-4 space-y-1 text-sm text-muted-foreground">
            {route.steps.map((s, index) => (
              <li
                key={`${s.instruction}-${index}`}
                className={index === stepIndex ? "font-medium text-foreground" : ""}
              >
                {index + 1}. {s.instruction} — {formatDistance(s.distanceMeters, lang)}
              </li>
            ))}
          </ol>
        )}

        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link to="/explorer">{lang === "en" ? "Back to the map" : "Retour à la carte"}</Link>
        </Button>
      </main>
    </div>
  );
}
