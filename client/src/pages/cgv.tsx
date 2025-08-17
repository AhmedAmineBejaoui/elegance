import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function CGV() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1554224155-3a587d6a210c?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">
          Conditions Générales de Vente
        </h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Les présentes conditions régissent l'ensemble des ventes réalisées
            sur la boutique Elegance.
          </p>
        </section>


        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les caractéristiques essentielles des produits sont présentées
                sur chaque fiche article. Les photos ne sont pas contractuelles
                mais reflètent fidèlement nos collections.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Prix</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les prix sont indiqués en dinar tunisien toutes taxes
                comprises. Les frais de livraison apparaissent au moment de la
                commande.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Commande</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Toute commande passée sur notre site suppose l'acceptation
                intégrale de ces conditions générales.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>4. Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Le règlement s'effectue en ligne par carte bancaire sécurisée
                ou à la livraison. Les données de paiement sont chiffrées et ne
                sont jamais conservées.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>5. Livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les commandes sont expédiées sous 48h ouvrées. Les délais
                varient ensuite selon le transporteur choisi.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>6. Retours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Vous disposez d'un délai de 14 jours après réception pour nous
                retourner un article non porté et non lavé.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}
