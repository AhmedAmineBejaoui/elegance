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
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const searchParams = new URLSearchParams(useSearch());
  const [location, navigate] = useLocation();
  
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!) : undefined,
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    isFeatured: searchParams.get("featured") === "true" ? true : undefined,
    isOnSale:
      searchParams.get("sale") === "true" ||
      searchParams.get("promo") === "true"
        ? true
        : undefined,
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const { data: productsData = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: [`/api/products?${new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value]) => [key, String(value)])
      )
    ).toString()}`],
  });

  const { data: categoriesData = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const products = Array.isArray(productsData) ? productsData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.categoryId) params.set("categoryId", filters.categoryId.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.isFeatured) params.set("featured", "true");
    if (filters.isOnSale) params.set("promo", "true");
    if (sortBy !== "newest") params.set("sort", sortBy);

    const newSearch = params.toString();
    const newPath = `/products${newSearch ? `?${newSearch}` : ""}`;
    
    if (location !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [filters, sortBy, location, navigate]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" data-testid="breadcrumb">
          <span>Accueil</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Produits</span>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 max-w-2xl">
            <Input
              type="text"
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

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
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
                    data-testid="view-mode-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="view-mode-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="products-sort-select">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Service indisponible, réessayez plus tard</h3>
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

            {/* Load More Button (if needed for pagination) */}
            {sortedProducts.length > 0 && sortedProducts.length % 20 === 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" data-testid="load-more-products">
                  Charger plus de produits
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
