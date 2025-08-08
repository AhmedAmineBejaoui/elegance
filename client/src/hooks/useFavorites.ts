import { useState } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (product: any) => {
    setFavorites((prev) => {
      const exists = prev.find((p: any) => p.id === product.id);
      const updated = exists
        ? prev.filter((p: any) => p.id !== product.id)
        : [...prev, product];
      try {
        localStorage.setItem("favorites", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isFavorite = (id: number) => favorites.some((p: any) => p.id === id);

  return { favorites, toggleFavorite, isFavorite };
}
