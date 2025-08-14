import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ProductFiltersProps {
  filters: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(filters.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(filters.colors || []);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(filters.categoryId);

  const { data: categoriesData = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const availableColors = ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Rose", "Beige", "Gris"];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        ...filters,
        categoryId: selectedCategoryId,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [priceRange, selectedSizes, selectedColors, selectedCategoryId]);

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes(prev => 
      checked 
        ? [...prev, size]
        : prev.filter(s => s !== size)
    );
  };

  const handleColorChange = (color: string, checked: boolean) => {
    setSelectedColors(prev => 
      checked 
        ? [...prev, color]
        : prev.filter(c => c !== color)
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 500]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategoryId(undefined);
    onFiltersChange({});
  };

  const activeFiltersCount = 
    (selectedCategoryId ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3" data-testid="filter-categories-title">Catégories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="category-all"
              checked={!selectedCategoryId}
              onCheckedChange={() => setSelectedCategoryId(undefined)}
              data-testid="filter-category-all"
            />
            <Label htmlFor="category-all">Toutes les catégories</Label>
          </div>
          {categories.map((category: any) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategoryId === category.id}
                onCheckedChange={() => setSelectedCategoryId(
                  selectedCategoryId === category.id ? undefined : category.id
                )}
                data-testid={`filter-category-${category.id}`}
              />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3" data-testid="filter-price-title">Prix (DT)</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            min={0}
            step={10}
            className="mb-4"
            data-testid="filter-price-slider"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span data-testid="filter-price-min">{priceRange[0]} DT</span>
            <span data-testid="filter-price-max">{priceRange[1]} DT</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-semibold mb-3" data-testid="filter-sizes-title">Tailles</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableSizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                data-testid={`filter-size-${size}`}
              />
              <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold mb-3" data-testid="filter-colors-title">Couleurs</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableColors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                data-testid={`filter-color-${color.toLowerCase()}`}
              />
              <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
          data-testid="filter-clear-all"
        >
          Effacer tous les filtres ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filtres</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" data-testid="filter-count-desktop">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="lg:hidden flex items-center space-x-2"
            data-testid="filter-mobile-trigger"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2" data-testid="filter-count-mobile">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Filtres
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                data-testid="filter-mobile-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategoryId && (
            <Badge
              variant="secondary"
              className="flex items-center space-x-1"
              data-testid={`active-filter-category-${selectedCategoryId}`}
            >
              <span>{categories.find((c: any) => c.id === selectedCategoryId)?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setSelectedCategoryId(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 500) && (
            <Badge
              variant="secondary"
              className="flex items-center space-x-1"
              data-testid="active-filter-price"
            >
              <span>{priceRange[0]}-{priceRange[1]} DT</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setPriceRange([0, 500])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedSizes.map((size) => (
            <Badge
              key={size}
              variant="secondary"
              className="flex items-center space-x-1"
              data-testid={`active-filter-size-${size}`}
            >
              <span>Taille {size}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => handleSizeChange(size, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedColors.map((color) => (
            <Badge
              key={color}
              variant="secondary"
              className="flex items-center space-x-1"
              data-testid={`active-filter-color-${color.toLowerCase()}`}
            >
              <span>{color}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => handleColorChange(color, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
