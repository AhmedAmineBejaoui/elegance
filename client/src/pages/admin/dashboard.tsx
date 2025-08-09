import { useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Product, Order } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: stats = {} as any, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: lowStockProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?lowStock=true"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  if (isLoading || (!isAuthenticated || user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total des commandes",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: "+12%",
      positive: true,
    },
    {
      title: "Revenus totaux",
      value: `${typeof stats?.totalRevenue === 'number' ? stats.totalRevenue.toFixed(2) : '0.00'} DT`,
      icon: DollarSign,
      change: "+8%",
      positive: true,
    },
    {
      title: "Produits",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "+3",
      positive: true,
    },
    {
      title: "Clients",
      value: stats?.totalCustomers || 0,
      icon: Users,
      change: "+15",
      positive: true,
    },
  ];

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
                <Link href="/admin" className="flex items-center px-6 py-3 bg-gray-800 text-white" data-testid="nav-dashboard">
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
                <Link href="/admin/categories" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-categories">
                  <FolderTree className="mr-3 h-5 w-5" />
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors" data-testid="nav-orders">
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
                Tableau de bord
              </h1>
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/">Voir le site</Link>
                </Button>
                <Button onClick={() => window.location.href = "/api/logout"} variant="outline">
                  Déconnexion
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <Card key={index} data-testid={`stat-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'} mt-1`}>
                          {stat.change} ce mois
                        </p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Commandes récentes</CardTitle>
                  <Link href="/admin/orders">
                    <Button variant="outline" size="sm">Voir tout</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune commande récente</p>
                  ) : (
                    <div className="space-y-4" data-testid="recent-orders">
                      {recentOrders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{parseFloat(order.total).toFixed(2)} DT</p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Stock faible</span>
                  </CardTitle>
                  <Link href="/admin/products">
                    <Button variant="outline" size="sm">Gérer</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : lowStockProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun produit en stock faible</p>
                  ) : (
                    <div className="space-y-4" data-testid="low-stock-products">
                      {lowStockProducts.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.images?.[0] || "/placeholder-product.jpg"}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {product.stockQuantity} restant{product.stockQuantity > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Link href="/admin/products">
                    <Button className="w-full justify-start" variant="outline" data-testid="quick-add-product">
                      <Package className="mr-2 h-4 w-4" />
                      Ajouter un produit
                    </Button>
                  </Link>
                  <Link href="/admin/categories">
                    <Button className="w-full justify-start" variant="outline" data-testid="quick-add-category">
                      <FolderTree className="mr-2 h-4 w-4" />
                      Ajouter une catégorie
                    </Button>
                  </Link>
                  <Link href="/admin/orders">
                    <Button className="w-full justify-start" variant="outline" data-testid="quick-view-orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Voir les commandes
                    </Button>
                  </Link>
                  <Link href="/admin/customers">
                    <Button className="w-full justify-start" variant="outline" data-testid="quick-view-customers">
                      <Users className="mr-2 h-4 w-4" />
                      Gérer les clients
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
