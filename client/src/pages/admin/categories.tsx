import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import type { Category, InsertCategory } from "@shared/schema";
import { API_BASE } from "@/lib/api";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

export default function AdminCategories() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
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

  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", slug: "", description: "" });
      toast({
        title: "Catégorie créée",
        description: "La catégorie a été créée avec succès.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Accès administrateur requis.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer la catégorie.",
          variant: "destructive",
        });
      }
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Accès administrateur requis.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie.",
          variant: "destructive",
        });
      }
    },
  });

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  if (isLoading || (!isAuthenticated || user?.role !== "admin")) {
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
                <Link
                  href="/admin"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  data-testid="nav-dashboard"
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  data-testid="nav-products"
                >
                  <Package className="mr-3 h-5 w-5" />
                  Produits
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/categories"
                  className="flex items-center px-6 py-3 bg-gray-800 text-white"
                  data-testid="nav-categories"
                >
                  <FolderTree className="mr-3 h-5 w-5" />
                  Catégories
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/orders"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  data-testid="nav-orders"
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Commandes
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/customers"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  data-testid="nav-customers"
                >
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
                Gestion des Catégories
              </h1>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-category">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une catégorie</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        data-testid="category-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
                        data-testid="category-slug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        data-testid="category-description"
                      />
                    </div>
                    <Button
                      onClick={() => createCategoryMutation.mutate(formData as unknown as InsertCategory)}
                      disabled={createCategoryMutation.isPending}
                      data-testid="confirm-add-category"
                    >
                      Créer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des catégories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune catégorie disponible</p>
                ) : (
                  <div className="space-y-4" data-testid="category-list">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          data-testid={`delete-category-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

