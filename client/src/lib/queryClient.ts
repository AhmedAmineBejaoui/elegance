import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE } from "./api";

async function handleApiError(res: Response, url: string) {
  if (!res.ok) {
    console.warn('API error', res.status, url);
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} on ${url}: ${text || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  _options?: { cache: string; headers: { "Cache-Control": string } },
): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await handleApiError(res, url);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = `${queryKey.join("/") as string}`;
    const res = await fetch(`${API_BASE}${url}`, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await handleApiError(res, url);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Provide a default query function so that useQuery calls
      // without an explicit queryFn still know how to fetch data.
      // This resolves runtime errors where React Query throws
      // "Missing queryFn" and causes pages (like the admin pages)
      // to render a blank screen.
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});