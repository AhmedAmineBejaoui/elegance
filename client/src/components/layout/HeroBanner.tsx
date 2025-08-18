// client/src/components/layout/HeroBanner.tsx
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroBanner() {
  return (
    <div
      className="relative h-[80vh] w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://cdn.shopify.com/s/files/1/0811/9576/1939/files/L1280520_1_2_163d4731-015c-483d-a689-a82cdb5ffbb2.png?v=1752209022')",
      }}
    >
      <div className="bg-black/50 text-white p-8 text-center rounded max-w-xl">
        <h1 className="text-4xl md:text-5xl font-light mb-4">
          Nouvelle Collection 2025
        </h1>
        <p className="mb-6 text-lg">
          Découvrez les dernières tendances mode féminine avec des pièces
          exclusives pour la femme tunisienne moderne.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              Découvrir la Collection
            </Button>
          </Link>
          <Link href="/products?promo=true">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black"
            >
              Voir les Promotions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
