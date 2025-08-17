import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { useEffect } from "react";

async function fetchAuthUser() {
  const res = await fetch(`${API_BASE}/api/auth/user`, { credentials: "include" });

  if (res.status === 401) {
    return { user: null }; // ✅ au lieu de throw
  }

  if (!res.ok) {
    throw new Error("Failed to load auth user");
  }

  return res.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Vérifier si l'utilisateur vient de s'authentifier
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Rafraîchir les données d'authentification
      refetch();
    }
  }, [refetch]);

  const user = data?.user ?? null;
  const isAuthenticated = Boolean(user && (user.id || user.sub));
  
  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    isError,
    refetch 
  };
}
