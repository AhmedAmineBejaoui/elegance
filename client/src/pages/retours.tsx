import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Clock, Info, Wallet } from "lucide-react";


export default function Retours() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Retours</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Si un article ne vous convient pas, vous pouvez nous le retourner
            facilement.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Délai</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Vous disposez de 14 jours après réception pour effectuer un
                retour.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les produits doivent être non portés, non lavés et dans leur
                emballage d'origine avec étiquettes.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <CardTitle>Procédure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Contactez notre service client à support@elegance.tn pour
                obtenir une étiquette de retour puis déposez votre colis dans le
                point relais le plus proche.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Remboursement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Le remboursement est effectué sous 7 jours après réception et
                vérification des articles retournés.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}
