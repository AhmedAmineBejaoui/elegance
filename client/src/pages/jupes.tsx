import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Jupes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Jupes</h1>
        <p className="text-gray-600">Découvrez notre collection de jupes féminines.</p>
      </main>
      <Footer />
    </div>
  );
}
