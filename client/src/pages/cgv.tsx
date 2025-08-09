import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CGV() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <h1 className="text-3xl font-bold mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-gray-600">
            Les présentes conditions régissent l'ensemble des ventes réalisées
            sur la boutique Elegance.
          </p>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Produits</h2>
            <p className="text-gray-600">
              Les caractéristiques essentielles des produits sont présentées
              sur chaque fiche article. Les photos ne sont pas contractuelles
              mais reflètent fidèlement nos collections.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">2. Prix</h2>
            <p className="text-gray-600">
              Les prix sont indiqués en dinar tunisien toutes taxes comprises.
              Les frais de livraison apparaissent au moment de la commande.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">3. Commande</h2>
            <p className="text-gray-600">
              Toute commande passée sur notre site suppose l'acceptation
              intégrale de ces conditions générales.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">4. Paiement</h2>
            <p className="text-gray-600">
              Le règlement s'effectue en ligne par carte bancaire sécurisée ou
              à la livraison. Les données de paiement sont chiffrées et ne sont
              jamais conservées.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">5. Livraison</h2>
            <p className="text-gray-600">
              Les commandes sont expédiées sous 48h ouvrées. Les délais varient
              ensuite selon le transporteur choisi.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">6. Retours</h2>
            <p className="text-gray-600">
              Vous disposez d'un délai de 14 jours après réception pour nous
              retourner un article non porté et non lavé.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
