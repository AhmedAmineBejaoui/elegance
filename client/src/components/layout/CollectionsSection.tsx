// client/src/components/layout/CollectionsSection.tsx
import { Link } from "wouter";

const collections = [
  {
    title: "Nouveautés",
    image: "/images/nouveautes.jpg",
    href: "/products?featured=true"
  },
  {
    title: "Tendances",
    image: "/images/tendances.jpg",
    href: "/products?category=tendance"
  },
  {
    title: "Promotions",
    image: "/images/promotions.jpg",
    href: "/products?promo=true"
  }
];

export function CollectionsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-10">
      {collections.map((col) => (
        <Link key={col.title} href={col.href} className="group block relative overflow-hidden rounded shadow">
          <img src={col.image} alt={col.title} className="w-full h-[350px] object-cover transition-transform group-hover:scale-105" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-center text-xl font-semibold">
            {col.title}
          </div>
        </Link>
      ))}
    </div>
  );
}
