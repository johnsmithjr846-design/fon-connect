import { useEffect, useMemo, useRef, useState } from "react";
import {
  BENIN_CENTER,
  BENIN_DEFAULT_ZOOM,
  CATEGORY_BY_ID,
  type ExplorePlace,
} from "@/lib/explore/categories";

type ExploreMapProps = {
  places: ExplorePlace[];
  selectedId: string | null;
  userPosition: { lat: number; lng: number } | null;
  routePolyline: string | null;
  onSelect: (place: ExplorePlace) => void;
  recenterToken: number;
};

let loaderPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
    | string
    | undefined;
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
    | string
    | undefined;
  if (!key) return Promise.reject(new Error("La carte n'est pas encore configurée."));

  loaderPromise = new Promise<void>((resolve, reject) => {
    const callbackName = "__fonconnectInitMap";
    (window as unknown as Record<string, unknown>)[callbackName] = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${callbackName}&language=fr&region=BJ${
      channel ? `&channel=${channel}` : ""
    }`;
    script.async = true;
    script.onerror = () => reject(new Error("La carte n'a pas pu être chargée."));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export default function ExploreMap({
  places,
  selectedId,
  userPosition,
  routePolyline,
  onSelect,
  recenterToken,
}: ExploreMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then(() => {
        if (!active || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: BENIN_CENTER,
          zoom: BENIN_DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      })
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  const placesKey = useMemo(() => places.map((p) => p.id).join("|"), [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: place.latitude, lng: place.longitude },
        title: `${CATEGORY_BY_ID[place.category]?.emoji ?? "📍"} ${place.name}`,
      });
      marker.addListener("click", () => onSelect(place));
      markersRef.current.push(marker);
      bounds.extend({ lat: place.latitude, lng: place.longitude });
    });

    if (places.length === 1) {
      map.setCenter({ lat: places[0]!.latitude, lng: places[0]!.longitude });
      map.setZoom(15);
    } else if (places.length > 1) {
      map.fitBounds(bounds, 48);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (!place) return;
    map.panTo({ lat: place.latitude, lng: place.longitude });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !userPosition) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        map,
        title: "Ma position",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#1d4ed8",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
    }
    userMarkerRef.current.setPosition(userPosition);
  }, [userPosition, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !userPosition) return;
    map.panTo(userPosition);
    map.setZoom(14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    lineRef.current?.setMap(null);
    lineRef.current = null;
    if (!routePolyline || !google.maps.geometry?.encoding) return;
    const path = google.maps.geometry.encoding.decodePath(routePolyline);
    lineRef.current = new google.maps.Polyline({
      map,
      path,
      strokeColor: "#15803d",
      strokeWeight: 5,
      strokeOpacity: 0.85,
    });
    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 48);
  }, [routePolyline, ready]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full rounded-xl" aria-label="Carte du Bénin" />;
}
