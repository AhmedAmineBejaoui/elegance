// client/src/pages/home.tsx
import { Link } from "wouter";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";
import { asArray } from "@/lib/api";

export default function Home() {
  const { data: featuredProductsData = [] } = useQuery<Product[]>({
    queryKey: ["/api/products?isFeatured=true&limit=8"],
  });

  const { data: categoriesData = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const featuredProducts = asArray<Product>(featuredProductsData);
  const categories = asArray<Category>(categoriesData);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-screen hero-gradient" data-testid="hero-section">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Nouvelle Collection
              <span className="block text-accent"> 2025</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Découvrez les dernières tendances mode féminine avec des pièces exclusives pour la femme tunisienne moderne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold"
                  data-testid="hero-discover-collection"
                >
                  Découvrir la Collection
                </Button>
              </Link>
              <Link href="/products?promo=true">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-primary hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
                  data-testid="hero-view-promotions"
                >
                  Voir les Promotions
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronDown className="h-8 w-8" />
        </div>
      </section>

      {/* Collections */}
      <section className="py-16 bg-gray-50" data-testid="featured-categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez nos collections soigneusement sélectionnées pour vous offrir le meilleur de la mode féminine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {asArray(categories).slice(0, 3).map((category: any) => (
              <Card
                key={category.id}
                className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid={`category-card-${category.id}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={category.imageUrl || "https://plus.unsplash.com/premium_photo-1690349404248-3ddd9be40eb1?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                    alt={category.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-200 mb-4">{category.description}</p>
                    <Link href={`/products?categoryId=${category.id}`}>
                      <Button
                        variant="secondary"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                        data-testid={`category-view-more-${category.id}`}
                      >
                        Voir Plus
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16" data-testid="featured-products">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nouveautés</h2>
              <p className="text-gray-600">Les dernières tendances sélectionnées pour vous</p>
            </div>
            <Link href="/products?featured=true">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 font-semibold flex items-center"
                data-testid="view-all-featured"
              >
                Voir Tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {asArray(featuredProducts).slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 hero-gradient" data-testid="promo-banner">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Soldes d'Été</h2>
          <p className="text-xl mb-8">Jusqu'à 50% de réduction sur une sélection de produits</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products?promo=true">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                data-testid="promo-discover-sales"
              >
                Découvrir les Soldes
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-primary hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
              data-testid="promo-newsletter"
            >
              S'inscrire à la Newsletter
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
