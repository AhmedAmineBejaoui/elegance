export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiRaw(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
}

