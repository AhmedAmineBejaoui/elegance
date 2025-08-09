import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Contact</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Une question sur votre commande ou sur nos produits ? Envoyez-nous un
          message, notre équipe vous répondra rapidement.
        </p>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nom
                </label>
                <Input id="name" placeholder="Votre nom" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input id="email" type="email" placeholder="vous@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea id="message" rows={5} placeholder="Votre message" />
              </div>
              <Button type="submit" className="w-full">
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-gray-600 text-center">
          Vous pouvez également nous écrire à
          <a
            href="mailto:support@elegance.tn"
            className="text-primary underline mx-1 inline-flex items-center gap-1"
          >
            <Mail className="h-4 w-4" /> support@elegance.tn
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
