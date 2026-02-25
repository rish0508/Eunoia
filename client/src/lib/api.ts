// Always default to same-origin unless explicitly overridden
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();

export function apiUrl(path: string) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
