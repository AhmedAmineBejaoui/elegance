import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative h-[60vh] flex items-center justify-center text-center text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1350&q=80')",
          }}
          data-testid="about-hero"
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">À propos d'Elegance</h1>
            <p className="text-lg md:text-xl text-gray-200">
              Mode tendance et engagement local pour la femme tunisienne
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-white" data-testid="about-story">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
              alt="Notre histoire"
              className="rounded-lg shadow-lg object-cover h-80 w-full"
            />
            <div>
              <h2 className="text-3xl font-bold mb-4">Notre Histoire</h2>
              <p className="text-gray-600 mb-4">
                Née en 2024 à Tunis, Elegance a pour mission d'offrir aux femmes
                tunisiennes des collections inspirées des dernières tendances
                internationales tout en valorisant le savoir-faire local.
              </p>
              <p className="text-gray-600">
                Nous sélectionnons chaque pièce avec soin afin qu'elle reflète
                élégance, confort et personnalité.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50" data-testid="about-values">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Nos Engagements</h2>
            <p className="text-gray-600 mb-8">
              Inspirées par les valeurs d'ASOS, nous croyons en une mode
              accessible, responsable et inclusive.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Créativité</h3>
                <p className="text-gray-600">
                  Des collections toujours renouvelées pour exprimer votre style.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Qualité</h3>
                <p className="text-gray-600">
                  Des matières choisies avec exigence et une confection soignée.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Proximité</h3>
                <p className="text-gray-600">
                  Une entreprise tunisienne à l'écoute de ses clientes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16" data-testid="about-cta">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Rejoignez l'univers Elegance
            </h2>
            <p className="text-gray-600 mb-8">
              Parcourez notre boutique et découvrez les pièces qui
              sublimeront votre quotidien.
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
