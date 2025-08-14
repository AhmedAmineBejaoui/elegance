export const API_BASE = import.meta.env.VITE_API_URL ?? ""; // vide = même origine

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// utilitaires anti-crash
export const asArray = <T,>(x: unknown): T[] => Array.isArray(x) ? (x as T[]) : [];

export async function apiRaw(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
}
