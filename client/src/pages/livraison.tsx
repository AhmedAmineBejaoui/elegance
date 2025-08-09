import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Livraison() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-4">Livraison</h1>
          <p className="text-gray-600">
            Nous livrons partout en Tunisie via nos partenaires logistiques.
            Choisissez l'option qui vous convient lors de la commande.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Standard</h2>
            <p className="text-gray-600 mb-2">2 à 5 jours ouvrés</p>
            <p className="text-gray-600">Gratuite dès 150 DT d'achat, sinon 7 DT.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Express</h2>
            <p className="text-gray-600 mb-2">1 à 2 jours ouvrés</p>
            <p className="text-gray-600">Tarif unique de 15 DT.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Suivi de colis</h2>
          <p className="text-gray-600">
            Un lien de suivi vous est envoyé par email dès l'expédition de votre
            commande.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
