import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { StarRating } from "@/components/reviews/star-rating";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useFavorites } from "@/hooks/useFavorites";
import { API_BASE, asArray } from "@/lib/api";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: product, isLoading, error } = useQuery<any>({
    queryKey: ["/api/products/slug", params?.slug],
    enabled: !!params?.slug,
  });

  const { data: relatedProductsData = [] } = useQuery<any[]>({
    queryKey: product?.categoryId
      ? [`/api/products?categoryId=${product.categoryId}&limit=4`]
      : [],
    enabled: !!product?.categoryId,
  });

  const { data: reviewsData = [] } = useQuery<any[]>({
    queryKey: product?.id ? ["/api/products", product.id, "reviews"] : [],
    enabled: !!product?.id,
  });

  const relatedProducts = asArray<any>(relatedProductsData);
  const reviews = asArray<any>(reviewsData);

  const images = asArray<any>(product?.images);
  const sizes = asArray<any>(product?.sizes);
  const colors = asArray<any>(product?.colors);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity,
        size: selectedSize || null,
        color: selectedColor || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit ajouté",
        description: `${product?.name} a été ajouté à votre panier.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Connexion requise",
          description:
            "Vous devez être connecté pour ajouter des produits au panier.",
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

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product);
    toast({
      title: isFavorite(product.id) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: `${product.name} ${isFavorite(product.id) ? "a été retiré" : "a été ajouté"} à vos favoris.`,
    });
  };

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      rating: number;
      title: string;
      comment: string;
    }) => {
      if (!product) return;
      await apiRequest("POST", `/api/products/${product.id}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/products", product?.id, "reviews"],
      });
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      toast({
        title: "Avis ajouté",
        description: "Votre avis a été publié avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour laisser un avis.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre avis.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (product?.sizes?.length > 0) setSelectedSize(product.sizes[0]);
    if (product?.colors?.length > 0) setSelectedColor(product.colors[0]);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link href="/products">
            <Button>Retour aux produits</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(product.price);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const isOnSale = salePrice && salePrice < price;
  const discountPercentage = isOnSale
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;
  const currentPrice = isOnSale ? salePrice : price;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({
        title: "Veuillez sélectionner une taille",
        variant: "destructive",
      });
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast({
        title: "Veuillez sélectionner une couleur",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note.",
        variant: "destructive",
      });
      return;
    }
    addReviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
  };
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" data-testid="breadcrumb">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Produits</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images?.[selectedImageIndex] || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover"
                data-testid="product-main-image"
              />
              {isOnSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="absolute top-4 right-4 bg-primary text-white">
                  Nouveau
                </Badge>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-primary" : "border-gray-200"
                    }`}
                    data-testid={`product-thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="product-title">
                {product.name}
              </h1>
              <p className="text-gray-600" data-testid="product-sku">
                SKU: {product.sku}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <StarRating value={averageRating} />
              <span className="text-gray-600" data-testid="product-rating">
                {averageRating.toFixed(1)} ({reviews.length} avis)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primary" data-testid="product-current-price">
                {currentPrice.toFixed(2)} DT
              </span>
              {isOnSale && (
                <span className="text-xl text-gray-400 line-through" data-testid="product-original-price">
                  {price.toFixed(2)} DT
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-700" data-testid="product-short-description">
                {product.shortDescription}
              </p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32" data-testid="size-selector">
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-40" data-testid="color-selector">
                    <SelectValue placeholder="Couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color: string) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center" data-testid="quantity-display">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  data-testid="quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Status */}
            <div data-testid="stock-status">
              {product.stockQuantity === 0 ? (
                <Badge variant="destructive">Rupture de stock</Badge>
              ) : product.stockQuantity <= 5 ? (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Plus que {product.stockQuantity} en stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  En stock
                </Badge>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.stockQuantity === 0}
                data-testid="add-to-cart-button"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.stockQuantity === 0 ? "Rupture de stock" : "Ajouter au Panier"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                data-testid="add-to-wishlist"
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-5 w-5" />
                <span>Livraison gratuite dès 150 DT</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="h-5 w-5" />
                <span>Retours gratuits sous 30 jours</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Paiement sécurisé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Avis ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping" data-testid="tab-shipping">Livraison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none" data-testid="product-description">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>Aucune description disponible pour ce produit.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">Aucun avis pour ce produit.</p>
                    {isAuthenticated && (
                      <p className="text-sm text-gray-500 mt-2">
                        Soyez le premier à laisser un avis !
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4" data-testid="reviews-list">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">
                              {review.user.firstName} {review.user.lastName}
                            </h4>
                            <StarRating value={review.rating} size="sm" />
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h5 className="font-medium mb-2">{review.title}</h5>
                        )}
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {isAuthenticated && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Ajouter un avis</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                      <Input
                        placeholder="Titre (optionnel)"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="Votre commentaire"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <Button type="submit" disabled={addReviewMutation.isPending}>
                        Publier l'avis
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Livraison en Tunisie</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Livraison gratuite dès 150 DT d'achat</li>
                      <li>• Livraison standard : 2-4 jours ouvrables</li>
                      <li>• Livraison express : 1-2 jours ouvrables (+10 DT)</li>
                      <li>• Paiement à la livraison disponible</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Retours</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Retours gratuits sous 30 jours</li>
                      <li>• Produits en état neuf avec étiquettes</li>
                      <li>• Remboursement sous 5-7 jours ouvrables</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="related-products">
              {asArray(relatedProducts).filter((p: any) => p.id !== product.id).slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
