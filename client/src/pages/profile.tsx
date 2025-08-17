
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Package, Heart, CreditCard, Shield, Edit, Save, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { API_BASE } from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
    }
  }, [user]);

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders/user"],
    enabled: isAuthenticated,
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/auth/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <Link href="/auth">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles et commandes</p>
            </div>
            <Button onClick={() => (window.location.href = `${API_BASE}/api/logout`)} variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                  </Badge>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Membre depuis {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profil</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Commandes</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Sécurité</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Informations personnelles</CardTitle>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled={true}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Code postal</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des commandes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                        <p className="text-gray-600 mb-4">Vous n'avez pas encore passé de commande.</p>
                        <Link href="/products">
                          <Button>Découvrir nos produits</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">Commande #{order.orderNumber}</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{parseFloat(order.total).toFixed(2)} DT</p>
                                <Badge variant={
                                  order.status === 'delivered' ? 'default' :
                                  order.status === 'pending' ? 'secondary' : 'outline'
                                }>
                                  {order.status === 'pending' ? 'En attente' :
                                   order.status === 'processing' ? 'En traitement' :
                                   order.status === 'shipped' ? 'Expédiée' :
                                   order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                              </span>
                              <Link href={`/orders`}>
                                <Button variant="outline" size="sm">
                                  Voir détails
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité et confidentialité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-medium text-emerald-900">Compte sécurisé</h4>
                          <p className="text-sm text-emerald-700">
                            Votre compte est protégé par l'authentification Google
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Méthode de connexion</h4>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <FcGoogle className="w-8 h-8" />
                          <div>
                            <p className="font-medium">Google Auth</p>
                            <p className="text-sm text-gray-600">Connexion sécurisée via Google</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Données de compte</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Gérez vos données personnelles et vos préférences de confidentialité.
                        </p>
                        <Button variant="outline" onClick={() => (window.location.href = `${API_BASE}/api/logout`)}>
                          Se déconnecter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
