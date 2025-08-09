import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function DonneesPersonnelles() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Données personnelles</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Nous attachons une grande importance à la confidentialité de vos
            données. Cette page explique comment elles sont collectées et
            utilisées.
          </p>
        </section>


        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Collecte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Nous recueillons les informations nécessaires au traitement de
                vos commandes : nom, adresse, email et historique d'achat.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ces données nous permettent d'expédier vos commandes et de vous
                proposer une expérience personnalisée sur notre site.
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vos droits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conformément à la loi, vous disposez d'un droit d'accès, de
                rectification et de suppression de vos données. Contactez-nous à
                l'adresse support@elegance.tn pour exercer vos droits.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}
