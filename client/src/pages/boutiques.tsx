import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Liste des boutiques physiques d'Elegance
const boutiques = [
  {
    nom: "Tunis Centre",
    adresse: "10 avenue Habib Bourguiba, Tunis",
    horaires: "Lun - Sam : 9h00 - 20h00",
  },
  {
    nom: "Sfax",
    adresse: "Rue de l'Indépendance, Sfax",
    horaires: "Lun - Sam : 9h30 - 19h30",
  },
  {
    nom: "Sousse",
    adresse: "Centre Commercial Slim Centre, Sousse",
    horaires: "Tous les jours : 10h00 - 21h00",
  },
  {
    nom: "Bizerte",
    adresse: "Avenue Hédi Chaker, Bizerte",
    horaires: "Lun - Dim : 9h00 - 19h00",
  },
];

export default function Boutiques() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <h1 className="text-3xl font-bold mb-4">Nos Boutiques</h1>
          <p className="text-gray-600">
            Retrouvez l'univers Elegance dans nos magasins à travers la
            Tunisie.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          {boutiques.map((b) => (
            <div key={b.nom} className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{b.nom}</h2>
              <p className="text-gray-600">{b.adresse}</p>
              <p className="text-gray-600">{b.horaires}</p>
            </div>
          ))}
        </section>

        <section className="text-center">
          <p className="text-gray-600">
            Aucune boutique près de chez vous ? Profitez de l'ensemble de
            notre collection sur notre boutique en ligne.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
