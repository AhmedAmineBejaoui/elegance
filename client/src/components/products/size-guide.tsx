import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SizeGuide() {
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" className="gap-2"><Ruler size={16} /> Bien choisir sa taille</Button></DialogTrigger>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Votre guide des tailles</DialogTitle>
        <DialogDescription>Prenez vos mesures en centimètres, sans serrer le mètre ruban.</DialogDescription>
      </DialogHeader>
      <ol className="space-y-4 text-sm leading-relaxed list-decimal pl-5">
        <li><strong>Poitrine :</strong> mesurez à l’endroit le plus fort, en gardant le ruban horizontal.</li>
        <li><strong>Taille :</strong> mesurez au creux naturel de la taille.</li>
        <li><strong>Hanches :</strong> mesurez à l’endroit le plus large, les pieds joints.</li>
      </ol>
      <p className="text-sm text-muted-foreground">Les coupes et les mesures varient selon les modèles. Consultez les tailles disponibles sur la fiche du produit et contactez-nous pour un conseil avant de commander.</p>
      <a href="/contact" className="underline text-sm underline-offset-4">Demander un conseil de taille</a>
    </DialogContent>
  </Dialog>;
}
