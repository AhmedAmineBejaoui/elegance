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
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">FAQ</h1>
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
