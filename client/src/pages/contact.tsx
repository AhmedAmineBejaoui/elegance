import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>

        <p className="text-gray-600 mb-8">
          Une question sur votre commande ou sur nos produits ? Envoyez-nous un
          message, notre équipe vous répondra rapidement.
        </p>

        <form className="max-w-xl space-y-4">
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
          <Button type="submit">Envoyer</Button>
        </form>

        <p className="text-gray-600 mt-12">
          Vous pouvez également nous écrire à
          <a
            href="mailto:support@elegance.tn"
            className="text-primary underline ml-1"
          >
            support@elegance.tn
          </a>
        </p>

      </main>
      <Footer />
    </div>
  );
}
