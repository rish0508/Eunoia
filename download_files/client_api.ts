// API base URL - empty string for same-origin (Vercel full-stack deployment)
// Only set VITE_API_BASE_URL if you need to call a different backend
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();

export function apiUrl(path: string) {
  // If no API_BASE, use relative URLs (same origin)
  if (!API_BASE) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
