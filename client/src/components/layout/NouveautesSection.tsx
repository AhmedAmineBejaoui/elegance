// client/src/components/layout/NouveautesSection.tsx
export function NouveautesSection() {
  return (
    <section className="px-4 py-10">
      <h2 className="text-3xl font-light text-center mb-6">Nouveautés</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TODO: Remplace ces blocs par des composants ProductCard dynamiques */}
        <div className="bg-gray-100 h-64 flex items-center justify-center">Produit 1</div>
        <div className="bg-gray-100 h-64 flex items-center justify-center">Produit 2</div>
        <div className="bg-gray-100 h-64 flex items-center justify-center">Produit 3</div>
        <div className="bg-gray-100 h-64 flex items-center justify-center">Produit 4</div>
      </div>
    </section>
  );
}
