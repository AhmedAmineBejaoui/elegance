import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function DonneesPersonnelles() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Données personnelles</h1>
        <p className="text-gray-600">Découvrez comment nous protégeons vos données personnelles.</p>
      </main>
      <Footer />
    </div>
  );
}
