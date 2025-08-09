import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function DonneesPersonnelles() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-4">Données personnelles</h1>
          <p className="text-gray-600">
            Nous attachons une grande importance à la confidentialité de vos
            données. Cette page explique comment elles sont collectées et
            utilisées.
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Collecte</h2>
            <p className="text-gray-600">
              Nous recueillons les informations nécessaires au traitement de vos
              commandes : nom, adresse, email et historique d'achat.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Utilisation</h2>
            <p className="text-gray-600">
              Ces données nous permettent d'expédier vos commandes et de vous
              proposer une expérience personnalisée sur notre site.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Vos droits</h2>
            <p className="text-gray-600">
              Conformément à la loi, vous disposez d'un droit d'accès, de
              rectification et de suppression de vos données. Contactez-nous à
              l'adresse support@elegance.tn pour exercer vos droits.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
