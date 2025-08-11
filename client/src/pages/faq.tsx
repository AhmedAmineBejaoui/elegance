import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1678216286021-e81f66761751?q=80&w=923&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">FAQ</h1>
      </section>
      <main className="flex-1 container mx-auto px-4 py-16">

        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              Quels sont les délais de livraison ?
            </AccordionTrigger>
            <AccordionContent>
              Les commandes sont préparées sous 48h ouvrées puis livrées en 2 à
              5 jours selon votre région.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Comment suivre ma commande ?</AccordionTrigger>
            <AccordionContent>
              Vous recevrez un email avec un lien de suivi dès l'expédition de
              votre colis.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Quels sont vos modes de paiement ?</AccordionTrigger>
            <AccordionContent>
              Nous acceptons les cartes bancaires tunisiennes et
              internationales ainsi que le paiement à la livraison.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Puis-je retourner un article ?</AccordionTrigger>
            <AccordionContent>
              Oui, les retours sont possibles sous 14 jours. Consultez notre
              page Retours pour plus de détails.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </main>
      <Footer />
    </div>
  );
}
