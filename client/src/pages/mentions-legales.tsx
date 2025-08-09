import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-16 space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-4">Mentions légales</h1>
          <p className="text-gray-600">
            Informations relatives à l'éditeur et aux conditions d'utilisation
            du site Elegance.
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Éditeur</h2>
            <p className="text-gray-600">
              Le site est édité par Elegance, société basée à Tunis, inscrite au
              registre du commerce sous le numéro 123456.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Responsable de la publication</h2>
            <p className="text-gray-600">Mme Amal Ben Ali.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Hébergement</h2>
            <p className="text-gray-600">
              Le site est hébergé par OVH, 2 rue Kellermann, 59100 Roubaix,
              France.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Propriété intellectuelle</h2>
            <p className="text-gray-600">
              Tous les éléments du site, textes et images, sont la propriété
              d'Elegance ou de ses partenaires et ne peuvent être reproduits
              sans autorisation préalable.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
