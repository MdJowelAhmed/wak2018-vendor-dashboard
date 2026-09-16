import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import {
  getGoogleMapsApiKey,
  loadGoogleMaps,
} from "../utils/loadGoogleMaps";

export type MapLocation = {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
};

const DEFAULT_LAT = 23.7465;
const DEFAULT_LNG = 90.376;

function component(
  components: any[] | undefined,
  type: string,
  useShort = false,
) {
  const match = components?.find((c) => c.types?.includes(type));
  return useShort ? match?.short_name : match?.long_name;
}

function locationFromPlace(place: any): MapLocation | null {
  const loc = place?.geometry?.location;
  if (!loc) return null;
  const latitude = Number(loc.lat());
  const longitude = Number(loc.lng());
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const parts = place.address_components as any[] | undefined;
  const streetNumber = component(parts, "street_number") ?? "";
  const route = component(parts, "route") ?? "";
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const countryShort = component(parts, "country", true) ?? "";

  return {
    latitude,
    longitude,
    address: street || place.formatted_address,
    city:
      component(parts, "locality") ||
      component(parts, "administrative_area_level_2") ||
      component(parts, "sublocality") ||
      "",
    state: component(parts, "administrative_area_level_1") || "",
    country: component(parts, "country") || "",
    countryCode: countryShort || "",
    postalCode: component(parts, "postal_code") || "",
  };
}

export function GoogleLocationPicker({
  latitude,
  longitude,
  countryIso,
  onChange,
}: {
  latitude?: number;
  longitude?: number;
  countryIso?: string;
  onChange: (location: MapLocation) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const searchEl = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const applyingExternal = useRef(false);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const lat = Number.isFinite(Number(latitude)) ? Number(latitude) : DEFAULT_LAT;
  const lng = Number.isFinite(Number(longitude))
    ? Number(longitude)
    : DEFAULT_LNG;

  function applyLocation(next: MapLocation, fromMap: boolean) {
    if (fromMap) applyingExternal.current = true;
    onChange(next);
  }

  function reverseGeocode(nextLat: number, nextLng: number) {
    const geocoder = geocoderRef.current;
    if (!geocoder) {
      applyLocation({ latitude: nextLat, longitude: nextLng }, true);
      return;
    }
    geocoder.geocode(
      { location: { lat: nextLat, lng: nextLng } },
      (results: any[], status: string) => {
        if (status === "OK" && results?.[0]) {
          const parsed = locationFromPlace(results[0]);
          applyLocation(
            parsed ?? { latitude: nextLat, longitude: nextLng },
            true,
          );
          return;
        }
        applyLocation({ latitude: nextLat, longitude: nextLng }, true);
      },
    );
  }

  function setMarkerPosition(nextLat: number, nextLng: number, pan = true) {
    const position = { lat: nextLat, lng: nextLng };
    markerRef.current?.setPosition(position);
    if (pan) mapRef.current?.panTo(position);
  }

  useEffect(() => {
    if (!getGoogleMapsApiKey()) {
      setError("Google Maps API key is missing in .env (VITE_API_GOOGLE_MAPS).");
      return;
    }

    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google.maps;
        const center = { lat, lng };

        const map = new g.Map(mapEl.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new g.Marker({
          position: center,
          map,
          draggable: true,
        });
        const geocoder = new g.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        map.addListener("click", (e: any) => {
          const nextLat = e.latLng.lat();
          const nextLng = e.latLng.lng();
          setMarkerPosition(nextLat, nextLng, false);
          reverseGeocode(nextLat, nextLng);
        });
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) return;
          reverseGeocode(pos.lat(), pos.lng());
        });

        if (searchEl.current) {
          const autocomplete = new g.places.Autocomplete(searchEl.current, {
            fields: ["geometry", "address_components", "formatted_address"],
            ...(countryIso
              ? { componentRestrictions: { country: countryIso.toLowerCase() } }
              : {}),
          });
          autocompleteRef.current = autocomplete;
          autocomplete.bindTo("bounds", map);
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const parsed = locationFromPlace(place);
            if (!parsed) return;
            setMarkerPosition(parsed.latitude, parsed.longitude);
            map.setZoom(16);
            applyLocation(parsed, true);
          });
        }

        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Could not load Google Maps");
      });

    return () => {
      cancelled = true;
    };
    // Initialize once; later coordinate changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autocompleteRef.current) return;
    autocompleteRef.current.setComponentRestrictions(
      countryIso ? { country: countryIso.toLowerCase() } : { country: [] },
    );
  }, [countryIso]);

  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (applyingExternal.current) {
      applyingExternal.current = false;
      return;
    }
    setMarkerPosition(lat, lng);
  }, [lat, lng]);

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="size-3.5 text-gray-500" />
          Pin location on Google Maps <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchEl}
            type="text"
            placeholder="Search an address, then drag the pin if needed"
            disabled={Boolean(error)}
            className="border-input placeholder:text-muted-foreground h-9 w-full rounded-md border bg-transparent py-1 pl-9 pr-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50",
          error ? "h-28" : "h-72",
        )}
      >
        <div ref={mapEl} className="absolute inset-0" />
        {!ready && !error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin mr-2" />
            Loading Google Maps…
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm text-red-600">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">Latitude</Label>
          <Input value={lat.toFixed(6)} readOnly className="bg-gray-50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Longitude
          </Label>
          <Input value={lng.toFixed(6)} readOnly className="bg-gray-50" />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Search or click the map to set coordinates. Latitude and longitude are
        filled automatically.
      </p>
    </div>
  );
}
