import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Server, Copyright } from "lucide-react";


export default function MentionsLegales() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Mentions légales</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <section>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">

            Informations relatives à l'éditeur et aux conditions d'utilisation
            du site Elegance.
          </p>
        </section>


        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle>Éditeur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Le site est édité par Elegance, société basée à Tunis, inscrite
                au registre du commerce sous le numéro 123456.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Responsable de la publication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Mme Amal Ben Ali.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Hébergement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Le site est hébergé par OVH, 2 rue Kellermann, 59100 Roubaix,
                France.
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center gap-2">
              <Copyright className="h-5 w-5 text-primary" />
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tous les éléments du site, textes et images, sont la propriété
                d'Elegance ou de ses partenaires et ne peuvent être reproduits
                sans autorisation préalable.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}
