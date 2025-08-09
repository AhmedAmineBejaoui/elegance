import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Retours() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-16 space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-4">Retours</h1>
          <p className="text-gray-600">
            Si un article ne vous convient pas, vous pouvez nous le retourner
            facilement.
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Délai</h2>
            <p className="text-gray-600">
              Vous disposez de 14 jours après réception pour effectuer un
              retour.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Conditions</h2>
            <p className="text-gray-600">
              Les produits doivent être non portés, non lavés et dans leur
              emballage d'origine avec étiquettes.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Procédure</h2>
            <p className="text-gray-600">
              Contactez notre service client à support@elegance.tn pour obtenir
              une étiquette de retour puis déposez votre colis dans le point
              relais le plus proche.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Remboursement</h2>
            <p className="text-gray-600">
              Le remboursement est effectué sous 7 jours après réception et
              vérification des articles retournés.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
