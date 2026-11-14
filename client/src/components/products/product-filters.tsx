import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface Filters {
  categoryId?: number; search?: string; minPrice?: number; maxPrice?: number;
  sizes?: string[]; colors?: string[];
}
interface Props { filters: Filters; onFiltersChange: (filters: Partial<Filters>) => void }

function FilterContent({ filters, onFiltersChange }: Props) {
  const { data = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const categories = Array.isArray(data) ? data : [];
  const toggle = (key: "sizes" | "colors", value: string, checked: boolean) => {
    const values = filters[key] || [];
    onFiltersChange({ [key]: checked ? [...values, value] : values.filter(item => item !== value) });
  };
  return <div className="space-y-7">
    <fieldset><legend className="font-medium mb-4">Catégories</legend><div className="space-y-3">
      <label className="flex gap-3 items-center text-sm"><input type="radio" name="category" checked={!filters.categoryId} onChange={() => onFiltersChange({ categoryId: undefined })} />Toutes les catégories</label>
      {categories.map(category => <label key={category.id} className="flex gap-3 items-center text-sm"><input type="radio" name="category" checked={filters.categoryId === category.id} onChange={() => onFiltersChange({ categoryId: category.id })}/>{category.name}</label>)}
    </div></fieldset>
    <fieldset><legend className="font-medium mb-4">Prix (TND)</legend><div className="grid grid-cols-2 gap-3">
      <Label className="space-y-2"><span>Minimum</span><input aria-label="Prix minimum" type="number" min="0" step="1" value={filters.minPrice ?? ""} onChange={e => onFiltersChange({ minPrice: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })} className="border rounded p-2 w-full font-normal" /></Label>
      <Label className="space-y-2"><span>Maximum</span><input aria-label="Prix maximum" type="number" min="0" step="1" value={filters.maxPrice ?? ""} onChange={e => onFiltersChange({ maxPrice: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })} className="border rounded p-2 w-full font-normal" /></Label>
    </div></fieldset>
    <fieldset><legend className="font-medium mb-4">Tailles</legend><div className="grid grid-cols-2 gap-3">{["XS", "S", "M", "L", "XL", "XXL"].map(size => <label key={size} className="flex items-center gap-2 text-sm"><Checkbox checked={filters.sizes?.includes(size) || false} onCheckedChange={checked => toggle("sizes", size, checked === true)}/>{size}</label>)}</div></fieldset>
    <fieldset><legend className="font-medium mb-4">Couleurs</legend><div className="grid grid-cols-2 gap-3">{["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Rose", "Beige", "Gris"].map(color => <label key={color} className="flex items-center gap-2 text-sm"><Checkbox checked={filters.colors?.includes(color) || false} onCheckedChange={checked => toggle("colors", color, checked === true)}/>{color}</label>)}</div></fieldset>
    <Button variant="outline" className="w-full" onClick={() => onFiltersChange({ categoryId: undefined, minPrice: undefined, maxPrice: undefined, sizes: undefined, colors: undefined })}>Réinitialiser les filtres</Button>
  </div>;
}

export function ProductFilters(props: Props) {
  const [open, setOpen] = useState(false);
  return <>
    <aside className="hidden lg:block w-56 shrink-0"><h2 className="text-lg font-semibold mb-6">Affiner la sélection</h2><FilterContent {...props}/></aside>
    <div className="lg:hidden"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" className="gap-2" data-testid="filter-mobile-trigger"><Filter size={16}/>Filtrer la collection</Button></SheetTrigger><SheetContent side="left" className="overflow-y-auto"><SheetHeader><SheetTitle>Affiner la sélection</SheetTitle></SheetHeader><div className="mt-6"><FilterContent {...props}/><Button className="w-full mt-6" onClick={() => setOpen(false)}>Voir les résultats</Button></div></SheetContent></Sheet></div>
  </>;
}
