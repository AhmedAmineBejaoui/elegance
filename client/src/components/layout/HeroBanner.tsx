// client/src/components/layout/HeroBanner.tsx
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroBanner() {
  return (
    <div className="relative h-[80vh] w-full bg-cover bg-center bg-[url('/images/hero.jpg')] flex items-center justify-center">
      <div className="bg-black/50 text-white p-8 text-center rounded max-w-xl">
        <h1 className="text-4xl md:text-5xl font-light mb-4">Nouvelle Collection Automne</h1>
        <p className="mb-6 text-lg">Découvrez les dernières tendances mode avec TunisianChic</p>
        <Link href="/products?category=nouveautes">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200">Explorer maintenant</Button>
        </Link>
      </div>
    </div>
  );
}
