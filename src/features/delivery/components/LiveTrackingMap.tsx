import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type LngLat = { lng: number; lat: number };

function parseLatLngFromText(text?: string | null): LngLat | null {
  if (!text) return null;
  const m = /Lat:\s*([-0-9.]+)\s*,\s*Lng:\s*([-0-9.]+)/i.exec(text);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lng, lat };
}

async function geocodeToLngLat(
  query: string,
  token: string,
  signal: AbortSignal,
): Promise<LngLat | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "1");

  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    features?: Array<{ center?: [number, number] }>;
  };
  const center = json.features?.[0]?.center;
  if (!center) return null;
  return { lng: center[0], lat: center[1] };
}

function haversineKm(a: LngLat, b: LngLat) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function LiveTrackingMap({
  pickupText,
  dropText,
  driverText,
  driverLat,
  driverLng,
  currentAddress,
  lastUpdatedAt,
}: {
  pickupText: string;
  dropText: string;
  driverText?: string | null;
  driverLat?: number | null;
  driverLng?: number | null;
  currentAddress?: string | null;
  lastUpdatedAt?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as
    | string
    | undefined;
  const [pickup, setPickup] = useState<LngLat | null>(() =>
    parseLatLngFromText(pickupText),
  );
  const [drop, setDrop] = useState<LngLat | null>(() =>
    parseLatLngFromText(dropText),
  );
  const [driver, setDriver] = useState<LngLat | null>(() => {
    if (
      driverLat != null &&
      driverLng != null &&
      Number.isFinite(driverLat) &&
      Number.isFinite(driverLng)
    ) {
      return { lng: driverLng, lat: driverLat };
    }
    return parseLatLngFromText(driverText ?? "") ?? null;
  });

  useEffect(() => {
    setPickup(parseLatLngFromText(pickupText));
  }, [pickupText]);
  useEffect(() => {
    setDrop(parseLatLngFromText(dropText));
  }, [dropText]);
  useEffect(() => {
    if (
      driverLat != null &&
      driverLng != null &&
      Number.isFinite(driverLat) &&
      Number.isFinite(driverLng)
    ) {
      setDriver({ lng: driverLng, lat: driverLat });
      return;
    }
    setDriver(parseLatLngFromText(driverText ?? "") ?? null);
  }, [driverText, driverLat, driverLng]);

  useEffect(() => {
    if (!token) return;
    if (pickup && drop) return;

    const ac = new AbortController();
    (async () => {
      try {
        const [p, d] = await Promise.all([
          pickup
            ? Promise.resolve(pickup)
            : geocodeToLngLat(pickupText, token, ac.signal),
          drop
            ? Promise.resolve(drop)
            : geocodeToLngLat(dropText, token, ac.signal),
        ]);
        if (p && !pickup) setPickup(p);
        if (d && !drop) setDrop(d);
        if (!driver && p) setDriver(p);
      } catch {
        // ignore (fallback UI will show)
      }
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pickupText, dropText]);

  const etaMinutes = useMemo(() => {
    if (!driver || !drop) return null;
    const km = haversineKm(driver, drop);
    const speedKmh = 35;
    const minutes = Math.max(1, Math.round((km / speedKmh) * 60));
    return minutes;
  }, [driver, drop]);

  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;
    if (!pickup || !drop) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [pickup.lng, pickup.lat],
      zoom: 11,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    const pickupMarker = new mapboxgl.Marker({ color: "#16a34a" })
      .setLngLat([pickup.lng, pickup.lat])
      .addTo(map);
    const dropMarker = new mapboxgl.Marker({ color: "#dc2626" })
      .setLngLat([drop.lng, drop.lat])
      .addTo(map);
    const driverStart = driver ?? pickup;
    const driverMarker = new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([driverStart.lng, driverStart.lat])
      .addTo(map);

    pickupMarkerRef.current = pickupMarker;
    dropMarkerRef.current = dropMarker;
    driverMarkerRef.current = driverMarker;

    map.on("load", () => {
      const routeId = "delivery-route";
      const routeSourceId = "delivery-route-source";

      const coords: [number, number][] = [
        [pickup.lng, pickup.lat],
        [driverStart.lng, driverStart.lat],
        [drop.lng, drop.lat],
      ];

      map.addSource(routeSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });

      map.addLayer({
        id: routeId,
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#895129",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickup.lng, pickup.lat]);
      bounds.extend([drop.lng, drop.lat]);
      map.fitBounds(bounds, { padding: 48, duration: 0 });
    });

    return () => {
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropMarkerRef.current = null;
      driverMarkerRef.current = null;
      map.remove();
    };
  }, [token, pickup, drop, driver]);

  // Keep markers + route in sync if driver location changes later.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pickup || !drop) return;

    if (pickupMarkerRef.current)
      pickupMarkerRef.current.setLngLat([pickup.lng, pickup.lat]);
    if (dropMarkerRef.current)
      dropMarkerRef.current.setLngLat([drop.lng, drop.lat]);

    const d = driver ?? pickup;
    if (driverMarkerRef.current)
      driverMarkerRef.current.setLngLat([d.lng, d.lat]);

    const src = map.getSource("delivery-route-source") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (src) {
      src.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [pickup.lng, pickup.lat],
            [d.lng, d.lat],
            [drop.lng, drop.lat],
          ],
        },
      });
    }
  }, [pickup, drop, driver]);

  if (!token) {
    return (
      <div className="text-sm text-gray-700">
        Map is not configured. Add{" "}
        <span className="font-mono">VITE_MAPBOX_TOKEN</span> to your
        environment.
      </div>
    );
  }

  if (!pickup || !drop) {
    return (
      <div className="text-sm text-gray-700">Waiting for driver update...</div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className="h-[320px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        ref={containerRef}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
        <div>
          <span className="font-semibold">Pickup</span> →{" "}
          <span className="font-semibold">Driver</span> →{" "}
          <span className="font-semibold">Drop</span>
        </div>
        <div className="font-semibold">
          {etaMinutes != null ? `ETA ~ ${etaMinutes} min` : "ETA —"}
        </div>
      </div>
      {(driverLat != null &&
        driverLng != null &&
        Number.isFinite(driverLat) &&
        Number.isFinite(driverLng)) ||
      currentAddress ||
      lastUpdatedAt ? (
        <div className="space-y-1 rounded-lg border border-gray-200/80 bg-muted/30 px-3 py-2 text-xs text-gray-700">
          {driverLat != null &&
          driverLng != null &&
          Number.isFinite(driverLat) &&
          Number.isFinite(driverLng) ? (
            <div className="font-mono tabular-nums">
              Current: {driverLat.toFixed(5)}, {driverLng.toFixed(5)}
            </div>
          ) : null}
          {currentAddress ? <div>{currentAddress}</div> : null}
          {lastUpdatedAt ? (
            <div className="text-muted-foreground">
              Last updated {new Date(lastUpdatedAt).toLocaleString()}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
