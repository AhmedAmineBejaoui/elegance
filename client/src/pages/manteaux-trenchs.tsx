
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function ManteauxTrenchs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section
          className="relative h-64 flex items-center justify-center text-center text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1589363360147-4f2d51541551?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <h1 className="relative z-10 text-4xl font-bold">
            Manteaux & Trenchs
          </h1>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">
            Restez chic par tous les temps avec nos manteaux et trenchs
            élégants.
          </p>
          <Link href="/products?search=Manteau">
            <Button>Découvrir la collection</Button>
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
