// Normalize API base to avoid accidentally generating relative URLs
// e.g. when VITE_API_URL is set to "./" which would lead to "./api/..." calls
const rawApiBase = import.meta.env.VITE_API_URL ?? "";
export const API_BASE = rawApiBase.startsWith(".") ? "" : rawApiBase; // default: same origin

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function apiGet(url: string) {
  const r = await fetch(`${API_BASE}${url}`, { credentials: 'include' });
  if (!r.ok) {
    console.warn('API error', r.status, url);
    const text = await r.text().catch(() => '');
    throw new Error(`API ${r.status} on ${url}: ${text || r.statusText}`);
  }
  return r.json();
}

// utilitaires anti-crash
export const asArray = <T,>(x: unknown): T[] => Array.isArray(x) ? (x as T[]) : [];

export async function apiRaw(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
}
