import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Button } from "@/components/ui/button";
import { Link } from "wouter";


export default function LaMarque() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1350&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <h1 className="relative z-10 text-4xl font-bold">La Marque</h1>
        </section>

        {/* Story */}
        <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <img
            src="https://images.unsplash.com/photo-1539109136880-43644a9a1b98?auto=format&fit=crop&w=800&q=80"
            alt="Atelier"
            className="rounded-lg shadow-lg object-cover w-full h-72"
          />
          <div>
            <h2 className="text-2xl font-semibold mb-4">Un héritage mode</h2>
            <p className="text-gray-600 mb-4">
              Depuis ses débuts, NAF NAF célèbre la féminité avec des pièces
              joyeuses et colorées. Elegance s'inspire de cet héritage pour
              proposer des collections pensées pour la femme tunisienne.
            </p>
            <p className="text-gray-600">
              Chaque saison, nous revisitons les classiques de la garde-robe
              avec un regard moderne et une attention particulière aux détails.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Découvrez notre dernière collection
            </h2>
            <Link href="/products">
              <Button>Parcourir les nouveautés</Button>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
