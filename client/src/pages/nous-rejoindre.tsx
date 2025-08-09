import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function NousRejoindre() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <h1 className="text-3xl font-bold mb-4">Nous rejoindre</h1>
          <p className="text-gray-600">
            Elegance grandit et recherche des talents passionnés par la mode.
            Consultez nos offres ci-dessous et envoyez votre candidature.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Conseiller·ère de vente</h2>
            <p className="text-gray-600 mb-4">
              Accueillir et accompagner nos clientes en boutique.
            </p>
            <Button asChild>
              <a href="mailto:jobs@elegance.tn?subject=Conseiller%20de%20vente">
                Postuler
              </a>
            </Button>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Styliste</h2>
            <p className="text-gray-600 mb-4">
              Participer à la création de nos prochaines collections.
            </p>
            <Button asChild>
              <a href="mailto:jobs@elegance.tn?subject=Styliste">
                Postuler
              </a>
            </Button>
          </div>
        </section>

        <section className="text-center">
          <p className="text-gray-600 mb-4">
            Aucune offre ne correspond à votre profil ? Envoyez-nous votre CV
            à jobs@elegance.tn.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
