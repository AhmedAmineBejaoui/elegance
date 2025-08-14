import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { API_BASE } from "@/lib/api";

export default function Cart() {
  const [promoCode, setPromoCode] = useState("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItemsData = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItems = Array.isArray(cartItemsData) ? cartItemsData : [];

  const { data: newsletterStatus } = useQuery<{ subscribed: boolean; discountAvailable: boolean }>({
    queryKey: ["/api/newsletter/status"],
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour modifier votre panier.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre panier.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour modifier votre panier.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit du panier.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Panier vidé",
        description: "Tous les produits ont été retirés de votre panier.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour vider votre panier.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de vider le panier.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity > 0) {
      updateQuantityMutation.mutate({ id, quantity });
    }
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  const applyPromoCode = () => {
    // This would typically validate the promo code with the backend
    toast({
      title: "Code promo",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier</h1>
          <p className="text-gray-600 mb-8">Vous devez être connecté pour voir votre panier.</p>
          <Button onClick={() => (window.location.href = `${API_BASE}/api/login`)} data-testid="cart-login">
            Se connecter
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 150 ? 0 : 7; // Free shipping over 150 DT
  const tax = subtotal * 0.19; // 19% VAT
  const discount = newsletterStatus?.discountAvailable ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" data-testid="breadcrumb">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Panier</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="cart-title">
            Votre Panier ({cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'})
          </h1>
          <Link href="/products">
            <Button variant="outline" className="flex items-center space-x-2" data-testid="continue-shopping">
              <ArrowLeft className="h-4 w-4" />
              <span>Continuer les achats</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-cart">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez vos articles favoris à votre panier.
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Commencer mes achats
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Articles dans votre panier</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={clearCartMutation.isPending}
                  data-testid="clear-cart"
                >
                  Vider le panier
                </Button>
              </div>

              {cartItems.map((item: any) => (
                <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        data-testid={`cart-item-image-${item.id}`}
                      />
                      
                      <div className="flex-1">
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary" data-testid={`cart-item-name-${item.id}`}>
                            {item.product.name}
                          </h3>
                        </Link>
                        
                        {(item.size || item.color) && (
                          <p className="text-sm text-gray-600 mt-1" data-testid={`cart-item-variant-${item.id}`}>
                            {item.size && `Taille: ${item.size}`}
                            {item.size && item.color && " • "}
                            {item.color && `Couleur: ${item.color}`}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                              data-testid={`cart-decrease-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center" data-testid={`cart-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending || item.quantity >= item.product.stockQuantity}
                              data-testid={`cart-increase-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold text-primary" data-testid={`cart-item-total-${item.id}`}>
                                {(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)} DT
                              </p>
                              {item.product.salePrice && (
                                <p className="text-sm text-gray-500 line-through">
                                  {(parseFloat(item.product.price) * item.quantity).toFixed(2)} DT
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => removeItem(item.id)}
                              disabled={removeItemMutation.isPending}
                              data-testid={`cart-remove-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span data-testid="cart-subtotal">{subtotal.toFixed(2)} DT</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span data-testid="cart-shipping">
                      {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} DT`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>TVA (19%)</span>
                    <span data-testid="cart-tax">{tax.toFixed(2)} DT</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction newsletter</span>
                      <span data-testid="cart-discount">-{discount.toFixed(2)} DT</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="cart-total">
                      {total.toFixed(2)} DT
                    </span>
                  </div>

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code promo</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Entrez votre code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        data-testid="promo-code-input"
                      />
                      <Button
                        variant="outline"
                        onClick={applyPromoCode}
                        data-testid="apply-promo-code"
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      Ajoutez {(150 - subtotal).toFixed(2)} DT pour bénéficier de la livraison gratuite !
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      size="lg"
                      data-testid="proceed-to-checkout"
                    >
                      Procéder au paiement
                    </Button>
                  </Link>

                  <div className="text-center">
                    <Link href="/products">
                      <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="continue-shopping-summary">
                        Continuer mes achats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
