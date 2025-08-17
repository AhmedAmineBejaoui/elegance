import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";

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

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Nos Boutiques</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Retrouvez l'univers Elegance dans nos magasins à travers la
            Tunisie.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          {boutiques.map((b) => (

            <Card key={b.nom}>
              <CardHeader>
                <CardTitle>{b.nom}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {b.adresse}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> {b.horaires}
                </p>
              </CardContent>
            </Card>

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
