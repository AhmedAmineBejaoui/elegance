import { useState, useEffect } from "react";
import { Search, Eye, Mail, Phone, MapPin, Package, TrendingUp, Users, ShoppingCart, Calendar, DollarSign, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { API_BASE } from "@/lib/api";

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
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

  // Mock data for customers since we don't have a specific customers endpoint
  // In a real implementation, this would be fetched from an API
  const { data: allUsersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: customerOrdersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: selectedCustomer?.id
      ? [`/api/orders?userId=${selectedCustomer.id}`]
      : [],
    enabled: !!selectedCustomer?.id && isAuthenticated && user?.role === 'admin',
  });

  const allUsers = Array.isArray(allUsersData) ? allUsersData : [];
  const customerOrders = Array.isArray(customerOrdersData)
    ? customerOrdersData
    : [];

  // Filter only customers (non-admin users)
  const customers = allUsers.filter((userItem: any) => userItem.role === 'customer');

  const filteredCustomers = customers.filter((customer: any) => {
    const matchesSearch = 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || customer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getCustomerStats = (customerId: string) => {
    // This would typically be calculated on the backend
    // For now, we'll return mock stats
    return {
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
    };
  };

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
                <Link href="/admin/customers" className="flex items-center px-6 py-3 bg-gray-800 text-white" data-testid="nav-customers">
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
                Gestion des Clients
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clients actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <span className="text-primary text-lg font-semibold">TND</span>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="search-customers"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select
                      value={roleFilter || "all"}
                      onValueChange={(value) =>
                        setRoleFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger data-testid="filter-role">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="customer">Clients</SelectItem>
                        <SelectItem value="admin">Administrateurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Liste des Clients ({filteredCustomers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun client trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total dépensé</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer: any) => {
                          const stats = getCustomerStats(customer.id);
                          return (
                            <tr key={customer.id} data-testid={`customer-row-${customer.id}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    src={customer.profileImageUrl || "/placeholder-avatar.jpg"}
                                    alt={`${customer.firstName} ${customer.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {customer.firstName} {customer.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">ID: {customer.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="secondary">{stats.totalOrders}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {stats.totalSpent.toFixed(2)} DT
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedCustomer(customer)}
                                      data-testid={`view-customer-${customer.id}`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Profil de {customer.firstName} {customer.lastName}
                                      </DialogTitle>
                                    </DialogHeader>
                                    
                                    <Tabs defaultValue="profile" className="w-full">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="profile">Profil</TabsTrigger>
                                        <TabsTrigger value="orders">Commandes</TabsTrigger>
                                      </TabsList>
                                      
                                      <TabsContent value="profile" className="space-y-6">
                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center space-x-2">
                                                <Users className="h-5 w-5" />
                                                <span>Informations personnelles</span>
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              <div className="flex items-center space-x-3">
                                                <img
                                                  src={customer.profileImageUrl || "/placeholder-avatar.jpg"}
                                                  alt={`${customer.firstName} ${customer.lastName}`}
                                                  className="w-16 h-16 rounded-full object-cover"
                                                />
                                                <div>
                                                  <h3 className="text-lg font-semibold">
                                                    {customer.firstName} {customer.lastName}
                                                  </h3>
                                                  <p className="text-gray-600">Client depuis {new Date(customer.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                              </div>
                                              
                                              <Separator />
                                              
                                              <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                  <Mail className="h-4 w-4 text-gray-400" />
                                                  <span className="text-sm">{customer.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline">{customer.role}</Badge>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                          
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center space-x-2">
                                                <DollarSign className="h-5 w-5" />
                                                <span>Statistiques</span>
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                                                  <p className="text-sm text-gray-600">Commandes</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                  <p className="text-2xl font-bold text-green-600">{stats.totalSpent.toFixed(2)} DT</p>
                                                  <p className="text-sm text-gray-600">Total dépensé</p>
                                                </div>
                                              </div>
                                              
                                              {stats.lastOrderDate && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                  <Calendar className="h-4 w-4" />
                                                  <span>Dernière commande: {new Date(stats.lastOrderDate).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </TabsContent>
                                      
                                      <TabsContent value="orders" className="space-y-4">
                                        {ordersLoading ? (
                                          <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                          </div>
                                        ) : (customerOrders as any[]).length === 0 ? (
                                          <div className="text-center py-8">
                                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Aucune commande trouvée</p>
                                          </div>
                                        ) : (
                                          <div className="space-y-3">
                                            {(customerOrders as any[]).map((order: any) => (
                                              <Card key={order.id}>
                                                <CardContent className="p-4">
                                                  <div className="flex items-center justify-between">
                                                    <div>
                                                      <h4 className="font-medium">#{order.orderNumber}</h4>
                                                      <p className="text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
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
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        )}
                                      </TabsContent>
                                    </Tabs>
                                  </DialogContent>
                                </Dialog>
                              </td>
                            </tr>
                          );
                        })}
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
