import { useQuery } from "@tanstack/react-query";

async function fetchAuthUser() {
  const res = await fetch("/api/auth/user", { credentials: "include" });

  if (res.status === 401) {
    return { user: null }; // ✅ au lieu de throw
  }

  if (!res.ok) {
    throw new Error("Failed to load auth user");
  }

  return res.json();
}

export function useAuth() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const user = data?.user ?? null;
  const isAuthenticated = Boolean(user && (user.id || user.sub));
  return { user, isAuthenticated, isLoading, isError };
}
