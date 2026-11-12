declare global {
  interface Window {
    google?: any;
  }
}

let mapsPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_API_GOOGLE_MAPS?.trim() ?? "";
}

export function loadGoogleMaps(): Promise<void> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Missing VITE_API_GOOGLE_MAPS"));
  }

  if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
    return Promise.resolve();
  }

  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      "google-maps-script",
    ) as HTMLScriptElement | null;

    const onReady = () => {
      if (window.google?.maps) resolve();
      else reject(new Error("Google Maps failed to initialize"));
    };

    if (existing) {
      if (window.google?.maps) {
        resolve();
        return;
      }
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}
