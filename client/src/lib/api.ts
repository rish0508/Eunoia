const RENDER_BACKEND = "https://eunoia-backend-kmga.onrender.com";

// Vite injects VITE_* at build time. If not set, use Render backend in production.
const raw = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();

const API_BASE =
  raw.length > 0
    ? raw
    : import.meta.env.PROD
      ? RENDER_BACKEND
      : "";

export function apiUrl(path: string) {
  // ensure single slash join
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
