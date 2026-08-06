import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const rawBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4060";
  // Extract just the origin (e.g., http://10.10.26.172:4060) without the /api/v1 path
  let origin = rawBaseUrl;
  try {
    const parsed = new URL(rawBaseUrl);
    origin = parsed.origin;
  } catch (e) {
    // Fallback if URL parsing fails
    origin = rawBaseUrl.replace(/\/api\/v\d+$/, "");
  }

  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
