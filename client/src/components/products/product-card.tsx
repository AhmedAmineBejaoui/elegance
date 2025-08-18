import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/reviews/star-rating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { API_BASE } from "@/lib/api";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { toggleFavorite, isFavorite } = useFavorites();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit ajouté",
        description: `${product.name} a été ajouté à votre panier.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour ajouter des produits au panier.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au panier.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    toast({
      title: isFavorite(product.id) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: `${product.name} ${isFavorite(product.id) ? "a été retiré" : "a été ajouté"} à vos favoris.`,
    });
  };

  const price = parseFloat(product.price);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const isOnSale = salePrice && salePrice < price;
  const discountPercentage = isOnSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <Card 
      className="group product-card overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.images?.[0] || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width={640}
            height={640}
            data-testid={`product-image-${product.id}`}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.isFeatured && (
            <Badge className="bg-primary text-white" data-testid={`product-badge-featured-${product.id}`}>
              Nouveau
            </Badge>
          )}
          {isOnSale && (
            <Badge className="bg-red-500 text-white" data-testid={`product-badge-sale-${product.id}`}>
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className={`absolute top-4 right-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/90 hover:bg-white shadow-md"
            onClick={handleToggleFavorite}
            data-testid={`product-wishlist-${product.id}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className={`absolute bottom-4 left-4 right-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stockQuantity === 0}
            data-testid={`product-add-to-cart-${product.id}`}
          >
            {product.stockQuantity === 0 ? "Rupture de stock" : "Ajouter au Panier"}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary transition-colors" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-2" data-testid={`product-category-${product.id}`}>
          {product.category?.name}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnSale ? (
              <>
                <span className="text-primary font-bold text-lg" data-testid={`product-sale-price-${product.id}`}>
                  {salePrice?.toFixed(2)} DT
                </span>
                <span className="text-gray-400 line-through text-sm" data-testid={`product-original-price-${product.id}`}>
                  {price.toFixed(2)} DT
                </span>
              </>
            ) : (
              <span className="text-primary font-bold text-lg" data-testid={`product-price-${product.id}`}>
                {price.toFixed(2)} DT
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <StarRating
              value={parseFloat(product.averageRating || "0")}
              size="sm"
            />
            <span className="text-gray-600 text-sm" data-testid={`product-review-count-${product.id}`}>
              ({product.reviewsCount || 0})
            </span>
          </div>
        </div>

        {/* Stock Status */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <p className="text-orange-500 text-sm mt-2" data-testid={`product-low-stock-${product.id}`}>
            Plus que {product.stockQuantity} en stock
          </p>
        )}
      </CardContent>
    </Card>
  );
}
