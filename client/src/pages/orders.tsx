import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Clock, Truck, CheckCircle, XCircle, User, ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { API_BASE } from "@/lib/api";

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "processing":
      return <Package className="w-4 h-4" />;
    case "shipped":
      return <Truck className="w-4 h-4" />;
    case "delivered":
      return <CheckCircle className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En préparation";
    case "shipped":
      return "Expédié";
    case "delivered":
      return "Livré";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export default function Orders() {
  const { isAuthenticated, isLoading } = useAuth();

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders/user"],
    enabled: isAuthenticated,
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = `${API_BASE}/api/login`;
      return;
    }
  }, [isAuthenticated, isLoading]);

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/invoice`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      a.download = `invoice-${orderId}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice", error);
    }
  };

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Link href="/profile" className="text-muted-foreground hover:text-foreground" data-testid="link-profile">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-light text-foreground">Mes Commandes</h1>
              </div>
              <p className="text-muted-foreground">Suivez l'état de vos commandes et téléchargez vos factures</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune commande</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Vous n'avez pas encore passé de commande. Découvrez notre collection !
                </p>
                <Link href="/products">
                  <Button data-testid="button-shop-now">Découvrir nos produits</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <Card key={order.id} className="hover:shadow-sm transition-shadow" data-testid={`order-${order.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <CardTitle className="text-lg">
                            Commande #{order.id}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(order.status)} data-testid={`status-${order.id}`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">{order.total} DT</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {Array.isArray(order.items)
                        ? order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4" data-testid={`order-item-${item.id}`}>
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            {item.product?.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity} × {item.price} DT
                            </p>
                          </div>
                          <p className="font-medium">
                            {(parseFloat(item.price) * item.quantity).toFixed(2)} DT
                          </p>
                        </div>
                          ))
                        : null}
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Adresse de livraison
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{order.shippingAddress?.name}</p>
                          <p>{order.shippingAddress?.address}</p>
                          <p>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
                          {order.shippingAddress?.phone && (
                            <p>Tél: {order.shippingAddress.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sous-total</span>
                            <span>{(order.total - 7).toFixed(2)} DT</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Livraison</span>
                            <span>7.00 DT</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>{order.total} DT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-muted-foreground">
                        Commande passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex space-x-2">
                        {order.status === "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.id)}
                            data-testid={`button-download-invoice-${order.id}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger la facture
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "processing") && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            data-testid={`button-track-order-${order.id}`}
                          >
                            <Link href={`/orders/${order.id}`} className="flex items-center">
                              <Truck className="w-4 h-4 mr-2" />
                              Suivre la commande
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}