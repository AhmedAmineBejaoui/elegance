import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";
import { API_BASE } from "@/lib/api";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && isOpen,
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

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity > 0) {
      updateQuantityMutation.mutate({ id, quantity });
    }
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const total = cartItems.reduce((sum: number, item) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((sum: number, item) => sum + item.quantity, 0);

  if (!isAuthenticated) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Panier</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-600 mb-4">Vous devez être connecté pour voir votre panier.</p>
            <Button onClick={() => (window.location.href = `${API_BASE}/api/login`)} data-testid="cart-login-button">
              Se connecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Panier ({itemCount})
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="cart-close">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-gray-600 mb-4">Votre panier est vide</p>
            <Button onClick={onClose} data-testid="cart-continue-shopping">
              Continuer les achats
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg" data-testid={`cart-item-${item.id}`}>
                  <img
                    src={item.product.images?.[0] || "/placeholder-product.jpg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" data-testid={`cart-item-name-${item.id}`}>
                      {item.product.name}
                    </h4>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-600" data-testid={`cart-item-variant-${item.id}`}>
                        {item.size && `Taille: ${item.size}`}
                        {item.size && item.color && ", "}
                        {item.color && `Couleur: ${item.color}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updateQuantityMutation.isPending}
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
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`cart-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold text-primary" data-testid={`cart-item-total-${item.id}`}>
                        {(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)} DT
                      </span>
                    </div>
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
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary" data-testid="cart-total">
                  {total.toFixed(2)} DT
                </span>
              </div>
              <div className="space-y-3">
                <Link href="/checkout">
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    onClick={onClose}
                    data-testid="cart-checkout"
                  >
                    Procéder au Paiement
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                  data-testid="cart-continue"
                >
                  Continuer les Achats
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
