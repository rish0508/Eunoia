const WORKER_FALLBACK = "https://eunoia.rishabhmathur0508.workers.dev";

// Vite injects VITE_* at build time. If Cloudflare Pages fails to inject it,
// this fallback ensures production still calls the Worker.
const raw = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();

const API_BASE =
  raw.length > 0
    ? raw
    : import.meta.env.PROD
      ? WORKER_FALLBACK
      : "";

export function apiUrl(path: string) {
  // ensure single slash join
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
