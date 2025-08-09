import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CGV() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Conditions Générales de Vente</h1>
        <p className="text-gray-600">Consultez nos conditions générales de vente.</p>
      </main>
      <Footer />
    </div>
  );
}
