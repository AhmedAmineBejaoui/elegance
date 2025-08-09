import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <p className="text-gray-600">Entrez en contact avec notre service client.</p>
      </main>
      <Footer />
    </div>
  );
}
