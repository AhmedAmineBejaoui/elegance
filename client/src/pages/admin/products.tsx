import { useState, useEffect, type ChangeEvent } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import type { Product, Category } from "@shared/schema";
import { API_BASE } from "@/lib/api";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  salePrice: string;
  sku: string;
  stockQuantity: string;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    salePrice: "",
    sku: "",
    stockQuantity: "",
    categoryId: "",
    images: [],
    sizes: [],
    colors: [],
    tags: [],
    isActive: true,
    isFeatured: false,
  });

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

  const { data: productsData = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?${new URLSearchParams({
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { categoryId: selectedCategory })
    }).toString()}`],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: categoriesData = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const products = Array.isArray(productsData) ? productsData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Produit créé",
        description: "Le produit a été créé avec succès.",
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
        description: "Impossible de créer le produit.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      resetForm();
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
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
        description: "Impossible de mettre à jour le produit.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
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
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: "",
      salePrice: "",
      sku: "",
      stockQuantity: "",
      categoryId: "",
      images: [],
      sizes: [],
      colors: [],
      tags: [],
      isActive: true,
      isFeatured: false,
    });
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleArrayInput = (field: 'sizes' | 'colors' | 'tags', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleImageInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    const images = await Promise.all(Array.from(files).map(toBase64));
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      categoryId: parseInt(formData.categoryId),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      sku: product.sku || "",
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId.toString(),
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
  };

  const handleDelete = (product: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Link href="/admin/products" className="flex items-center px-6 py-3 bg-gray-800 text-white" data-testid="nav-products">
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
                Gestion des Produits
              </h1>
              <div className="flex items-center space-x-4">
                <Dialog open={isCreateModalOpen || !!editingProduct} onOpenChange={(open) => {
                  if (!open) {
                    setIsCreateModalOpen(false);
                    setEditingProduct(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      className="bg-primary hover:bg-primary/90"
                      data-testid="add-product-button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau Produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nom du produit *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            data-testid="product-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slug">Slug</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleInputChange("slug", e.target.value)}
                            data-testid="product-slug"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shortDescription">Description courte</Label>
                        <Input
                          id="shortDescription"
                          value={formData.shortDescription}
                          onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                          data-testid="product-short-description"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          rows={4}
                          data-testid="product-description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Prix *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => handleInputChange("price", e.target.value)}
                            data-testid="product-price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="salePrice">Prix soldé</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            value={formData.salePrice}
                            onChange={(e) => handleInputChange("salePrice", e.target.value)}
                            data-testid="product-sale-price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="stockQuantity">Stock</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                            data-testid="product-stock"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => handleInputChange("sku", e.target.value)}
                            data-testid="product-sku"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryId">Catégorie *</Label>
                          <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                            <SelectTrigger data-testid="product-category">
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="images">Images</Label>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          onChange={handleImageInput}
                          data-testid="product-images"
                        />
                        {formData.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Image ${idx + 1}`}
                                className="h-20 w-20 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
                          <Input
                            id="sizes"
                            value={formData.sizes.join(', ')}
                            onChange={(e) => handleArrayInput("sizes", e.target.value)}
                            placeholder="XS, S, M, L, XL"
                            data-testid="product-sizes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
                          <Input
                            id="colors"
                            value={formData.colors.join(', ')}
                            onChange={(e) => handleArrayInput("colors", e.target.value)}
                            placeholder="Rouge, Bleu, Noir"
                            data-testid="product-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input
                          id="tags"
                          value={formData.tags.join(', ')}
                          onChange={(e) => handleArrayInput("tags", e.target.value)}
                          placeholder="été, casual, tendance"
                          data-testid="product-tags"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                            data-testid="product-active"
                          />
                          <Label htmlFor="isActive">Produit actif</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                            data-testid="product-featured"
                          />
                          <Label htmlFor="isFeatured">Produit mis en avant</Label>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateModalOpen(false);
                            setEditingProduct(null);
                            resetForm();
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                          data-testid="submit-product"
                        >
                          {editingProduct ? "Mettre à jour" : "Créer"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
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
                        placeholder="Rechercher par nom ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="search-products"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select
                      value={selectedCategory || "all"}
                      onValueChange={(value) =>
                        setSelectedCategory(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger data-testid="filter-category">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Liste des Produits ({filteredProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun produit trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product: any) => (
                          <tr key={product.id} data-testid={`product-row-${product.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={product.images?.[0] || "/placeholder-product.jpg"}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {categories.find((c: any) => c.id === product.categoryId)?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.salePrice ? (
                                  <>
                                    <span className="font-medium">{parseFloat(product.salePrice).toFixed(2)} DT</span>
                                    <br />
                                    <span className="text-gray-500 line-through">{parseFloat(product.price).toFixed(2)} DT</span>
                                  </>
                                ) : (
                                  <span className="font-medium">{parseFloat(product.price).toFixed(2)} DT</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={
                                product.stockQuantity === 0 ? "destructive" :
                                product.stockQuantity <= 5 ? "secondary" : "default"
                              }>
                                {product.stockQuantity}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? "Actif" : "Inactif"}
                                </Badge>
                                {product.isFeatured && (
                                  <Badge variant="outline">Mis en avant</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  data-testid={`edit-product-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(product)}
                                  className="text-red-600 hover:text-red-800"
                                  data-testid={`delete-product-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
