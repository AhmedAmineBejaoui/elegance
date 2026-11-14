import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function Products() {
  const searchParams = new URLSearchParams(useSearch());
  const [, navigate] = useLocation();
  const filters = {
    categoryId: searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined,
    search: searchParams.get("search") || "",
    minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    isFeatured: searchParams.get("featured") === "true" ? true : undefined,
    isOnSale: searchParams.get("promo") === "true" || searchParams.get("sale") === "true" ? true : undefined,
    sizes: searchParams.get("sizes")?.split(",").filter(Boolean),
    colors: searchParams.get("colors")?.split(",").filter(Boolean),
  };
  const sortBy = searchParams.get("sort") || "newest";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState(filters.search);
  useEffect(() => setSearchTerm(filters.search), [filters.search]);

  const setFilters = (next: typeof filters | ((previous: typeof filters) => Partial<typeof filters>)) => {
    const result = typeof next === "function" ? { ...filters, ...next(filters) } : next;
    const params = new URLSearchParams();
    Object.entries(result).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && (!Array.isArray(value) || value.length)) {
        params.set(key === "isFeatured" ? "featured" : key === "isOnSale" ? "promo" : key, String(value));
      }
    });
    if (sortBy !== "newest") params.set("sort", sortBy);
    navigate(`/products?${params}`);
  };
  const setSortBy = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    navigate(`/products?${params}`);
  };
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") queryParams.set(key, String(value));
  });
  const { data: productsData = [], isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: [`/api/products?${queryParams}`],
  });
  const products = Array.isArray(productsData) ? productsData : [];
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => setFilters(previous => ({ ...previous, ...newFilters }));
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters(previous => ({ ...previous, search: searchTerm.trim() }));
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.salePrice || a.price) - parseFloat(b.salePrice || b.price);
      case "price-high":
        return parseFloat(b.salePrice || b.price) - parseFloat(a.salePrice || a.price);
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        return (
          parseFloat(b.averageRating || "0") -
          parseFloat(a.averageRating || "0")
        );
      case "newest":
      default:
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
    }
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" data-testid="breadcrumb">
          <a href="/" className="hover:underline">Accueil</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Produits</span>
        </nav>

        <div className="flex flex-wrap justify-between items-end gap-4 mb-8"><div><p className="eyebrow text-stone-500 mb-3">Le vestiaire ELEGANCE</p><h1 className="font-serif text-4xl">{filters.isOnSale ? "Les promotions" : filters.isFeatured ? "Les nouveautés" : "La collection"}</h1></div></div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 max-w-2xl">
            <Input
              aria-label="Rechercher dans la collection"
              type="search"
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="products-search-input"
            />
            <Button type="submit" data-testid="products-search-submit">
              Rechercher
            </Button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600" data-testid="products-count">
                  {sortedProducts.length} produit{sortedProducts.length !== 1 ? "s" : ""}
                </span>
                
                {/* View Mode Toggle */}
                <div className="hidden md:flex items-center space-x-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Afficher en grille" data-testid="view-mode-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    aria-label="Afficher en liste" data-testid="view-mode-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger aria-label="Trier les produits" className="w-48" data-testid="products-sort-select">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">La collection est momentanément indisponible</h3><Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16" data-testid="no-products">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou de supprimer certains filtres.
                </p>
                <Button
                  onClick={() =>
                    setFilters({
                      categoryId: undefined,
                      search: "",
                      minPrice: undefined,
                      maxPrice: undefined,
                      isFeatured: undefined,
                      isOnSale: undefined,
                      sizes: undefined,
                      colors: undefined,
                    })
                  }
                >
                  Effacer tous les filtres
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`} data-testid="products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}


          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
