import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Scissors } from "lucide-react";


export default function NousRejoindre() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1551836022-4c4c79ecde16?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Nous rejoindre</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Elegance grandit et recherche des talents passionnés par la mode.
            Consultez nos offres ci-dessous et envoyez votre candidature.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Conseiller·ère de vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Accueillir et accompagner nos clientes en boutique.
              </p>
              <Button asChild>
                <a href="mailto:casadelmarguesthouse@gmail.com">
                  Postuler
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              <CardTitle>Styliste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Participer à la création de nos prochaines collections.
              </p>
              <Button asChild>
                <a href="mailto:casadelmarguesthouse@gmail.com?subject=Styliste">Postuler</a>
              </Button>
            </CardContent>
          </Card>

        </section>

        <section className="text-center">
          <p className="text-gray-600 mb-4">

            Aucune offre ne correspond à votre profil ? Envoyez-nous votre CV à
            casadelmarguesthouse@gmail.com.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  );
}
