
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";


export default function Shorts() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section
          className="relative h-64 flex items-center justify-center text-center text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1350&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <h1 className="relative z-10 text-4xl font-bold">Shorts</h1>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">
            Confort et style pour les journées ensoleillées.
          </p>
          <Link href="/products?search=Short">
            <Button>Découvrir la collection</Button>
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
