import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package } from "lucide-react";


export default function Livraison() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Livraison</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Nous livrons partout en Tunisie via nos partenaires logistiques.
            Choisissez l'option qui vous convient lors de la commande.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Standard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <p>2 à 5 jours ouvrés</p>
              <p>Gratuite dès 150 DT d'achat, sinon 7 DT.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Express</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <p>1 à 2 jours ouvrés</p>
              <p>Tarif unique de 15 DT.</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="max-w-md mx-auto">
            <CardHeader className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Suivi de colis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Un lien de suivi vous est envoyé par email dès l'expédition de
                votre commande.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}
