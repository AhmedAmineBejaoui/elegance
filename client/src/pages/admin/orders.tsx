import { useState, useEffect } from "react";
import { Search, Eye, Edit, Package, TrendingUp, Users, ShoppingCart, Truck, CheckCircle, XCircle, Clock, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { API_BASE } from "@/lib/api";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ["/api/orders", selectedOrder?.id],
    enabled: !!selectedOrder?.id && isAuthenticated && user?.role === 'admin',
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Accès administrateur requis.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "En attente" },
      processing: { variant: "default" as const, icon: Package, label: "En traitement" },
      shipped: { variant: "default" as const, icon: Truck, label: "Expédiée" },
      delivered: { variant: "default" as const, icon: CheckCircle, label: "Livrée" },
      cancelled: { variant: "destructive" as const, icon: XCircle, label: "Annulée" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const filteredOrders = (orders as any[]).filter((order: any) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStatuses = [
    { value: "pending", label: "En attente" },
    { value: "processing", label: "En traitement" },
    { value: "shipped", label: "Expédiée" },
    { value: "delivered", label: "Livrée" },
    { value: "cancelled", label: "Annulée" },
  ];

  if (isLoading || (!isAuthenticated || user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-primary">Elegance</h1>
              <span className="text-sm text-gray-400">Admin</span>
            </Link>
          </div>
          
          <nav className="flex-1 mt-8">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-dashboard">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/admin/products" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-products">
                  <Package className="mr-3 h-5 w-5" />
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-categories">
                  <FolderTree className="mr-3 h-5 w-5" />
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="flex items-center px-6 py-3 bg-gray-800 text-white" data-testid="nav-orders">
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Commandes
                </Link>
              </li>
              <li>
                <Link href="/admin/customers" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-customers">
                  <Users className="mr-3 h-5 w-5" />
                  Clients
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profileImageUrl || "/placeholder-avatar.jpg"}
                alt="Admin"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                Gestion des Commandes
              </h1>
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/">Voir le site</Link>
                </Button>
                <Button onClick={() => (window.location.href = `${API_BASE}/api/logout`)} variant="outline">
                  Déconnexion
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher par numéro de commande ou nom client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="search-orders"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select
                      value={statusFilter || "all"}
                      onValueChange={(value) =>
                        setStatusFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger data-testid="filter-status">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Liste des Commandes ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order: any) => (
                          <tr key={order.id} data-testid={`order-row-${order.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                                <div className="text-sm text-gray-500">{order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{order.shippingAddress?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {parseFloat(order.total).toFixed(2)} DT
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedOrder(order)}
                                      data-testid={`view-order-${order.id}`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Détails de la commande #{order.orderNumber}</DialogTitle>
                                    </DialogHeader>
                                    
                                    {orderDetailsLoading ? (
                                      <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                      </div>
                                    ) : orderDetails ? (
                                      <div className="space-y-6">
                                        {/* Order Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                            <h3 className="font-semibold mb-3">Informations de commande</h3>
                                            <div className="space-y-2 text-sm">
                                              <p><span className="font-medium">Numéro:</span> #{order.orderNumber}</p>
                                              <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                              <p><span className="font-medium">Statut:</span> {getStatusBadge(order.status)}</p>
                                              <p><span className="font-medium">Paiement:</span> {order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire'}</p>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <h3 className="font-semibold mb-3">Adresse de livraison</h3>
                                            <div className="text-sm space-y-1">
                                              <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                              <p>{order.shippingAddress?.address}</p>
                                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.governorate}</p>
                                              <p>{order.shippingAddress?.postalCode}</p>
                                              <p>{order.shippingAddress?.phone}</p>
                                              <p>{order.shippingAddress?.email}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <Separator />

                                        {/* Order Items */}
                                        <div>
                                          <h3 className="font-semibold mb-3">Articles commandés</h3>
                                          <div className="space-y-3">
                                            {(orderDetails as any)?.items?.map((item: any) => (
                                              <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                  src={item.product?.images?.[0] || "/placeholder-product.jpg"}
                                                  alt={item.product?.name}
                                                  className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                  <h4 className="font-medium">{item.product?.name}</h4>
                                                  <div className="text-sm text-gray-600">
                                                    {item.size && <span>Taille: {item.size}</span>}
                                                    {item.size && item.color && " • "}
                                                    {item.color && <span>Couleur: {item.color}</span>}
                                                  </div>
                                                  <div className="text-sm">
                                                    Quantité: {item.quantity} × {parseFloat(item.price).toFixed(2)} DT
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-semibold">
                                                    {(parseFloat(item.price) * item.quantity).toFixed(2)} DT
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <Separator />

                                        {/* Order Total */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span>Sous-total:</span>
                                              <span>{parseFloat(order.subtotal).toFixed(2)} DT</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Livraison:</span>
                                              <span>{parseFloat(order.shipping).toFixed(2)} DT</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>TVA:</span>
                                              <span>{parseFloat(order.tax).toFixed(2)} DT</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-semibold text-lg">
                                              <span>Total:</span>
                                              <span className="text-primary">{parseFloat(order.total).toFixed(2)} DT</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Update */}
                                        <div>
                                          <h3 className="font-semibold mb-3">Mettre à jour le statut</h3>
                                          <div className="flex items-center space-x-3">
                                            <Select 
                                              value={order.status} 
                                              onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                                            >
                                              <SelectTrigger className="w-48">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {orderStatuses.map((status) => (
                                                  <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <span className="text-sm text-gray-500">
                                              Sélectionnez un nouveau statut pour cette commande
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <p>Impossible de charger les détails de la commande.</p>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Select 
                                  value={order.status} 
                                  onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {orderStatuses.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
