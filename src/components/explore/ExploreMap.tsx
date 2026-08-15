import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BENIN_CENTER,
  BENIN_DEFAULT_ZOOM,
  CATEGORY_BY_ID,
  type ExplorePlace,
} from "@/lib/explore/categories";
import { decodePolyline } from "@/lib/explore/polyline";
import { getTileProvider } from "@/lib/explore/tiles";

type ExploreMapProps = {
  places: ExplorePlace[];
  selectedId: string | null;
  userPosition: { lat: number; lng: number } | null;
  routePolyline: string | null;
  onSelect: (place: ExplorePlace) => void;
  recenterToken: number;
};

/** Carte Leaflet + OpenStreetMap : aucune clé API, aucun service Google. */
export default function ExploreMap({
  places,
  selectedId,
  userPosition,
  routePolyline,
  onSelect,
  recenterToken,
}: ExploreMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const lineRef = useRef<Polyline | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import("leaflet")
      .then((mod) => {
        const L = (mod as unknown as { default?: typeof import("leaflet") }).default ?? mod;
        if (!active || !containerRef.current || mapRef.current) return;
        leafletRef.current = L;
        const tiles = getTileProvider();
        const map = L.map(containerRef.current, {
          center: [BENIN_CENTER.lat, BENIN_CENTER.lng],
          zoom: BENIN_DEFAULT_ZOOM,
          zoomControl: true,
        });
        L.tileLayer(tiles.urlTemplate, {
          attribution: tiles.attribution,
          maxZoom: tiles.maxZoom,
          ...(tiles.subdomains ? { subdomains: tiles.subdomains } : {}),
        }).addTo(map);
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => active && setError("La carte n'a pas pu être chargée."));
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const placesKey = useMemo(() => places.map((p) => p.id).join("|"), [places]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const points: [number, number][] = [];
    places.forEach((place) => {
      const emoji = CATEGORY_BY_ID[place.category]?.emoji ?? "📍";
      const icon = L.divIcon({
        className: "",
        html: `<span style="font-size:22px;line-height:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))">${emoji}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 22],
      });
      const marker = L.marker([place.latitude, place.longitude], { icon, title: place.name })
        .addTo(map)
        .on("click", () => onSelect(place));
      markersRef.current.push(marker);
      points.push([place.latitude, place.longitude]);
    });

    if (points.length === 1) {
      map.setView(points[0]!, 15);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (!place) return;
    map.panTo([place.latitude, place.longitude]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L || !userPosition) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker([userPosition.lat, userPosition.lng], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#1d4ed8",
        fillOpacity: 1,
      }).addTo(map) as unknown as Marker;
    } else {
      (userMarkerRef.current as unknown as { setLatLng: (v: [number, number]) => void }).setLatLng([
        userPosition.lat,
        userPosition.lng,
      ]);
    }
  }, [userPosition, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !userPosition) return;
    map.setView([userPosition.lat, userPosition.lng], 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterToken]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L) return;
    lineRef.current?.remove();
    lineRef.current = null;
    if (!routePolyline) return;
    const path = decodePolyline(routePolyline).map((p) => [p.lat, p.lng] as [number, number]);
    if (!path.length) return;
    lineRef.current = L.polyline(path, {
      color: "#15803d",
      weight: 5,
      opacity: 0.85,
    }).addTo(map);
    map.fitBounds(L.latLngBounds(path), { padding: [40, 40] });
  }, [routePolyline, ready]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-xl [&_.leaflet-container]:bg-muted"
      aria-label="Carte du Bénin (OpenStreetMap)"
    />
  );
}
