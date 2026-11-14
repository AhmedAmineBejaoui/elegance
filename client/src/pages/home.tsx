import { Link } from "wouter";
import { ArrowRight, ArrowDown, Truck, Heart, Ruler, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { SizeGuide } from "@/components/products/size-guide";
import { StoreImage } from "@/components/ui/store-image";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";
import { asArray } from "@/lib/api";

const inspirations = [
  { title: "L’allure naturelle", subtitle: "Des silhouettes qui vous ressemblent", image: "/images/categories/robes.jpg", href: "/robes", label: "Explorer les robes" },
  { title: "Le sens du détail", subtitle: "La touche qui change tout", image: "/images/categories/accessoires.jpg", href: "/products", label: "Explorer la collection" },
  { title: "Les essentiels", subtitle: "L’élégance, à chaque pas", image: "/images/categories/chaussures.jpg", href: "/products", label: "Trouver mes essentiels" },
];

export default function Home() {
  const { data: featuredData, isLoading, isError, refetch } = useQuery<Product[]>({ queryKey: ["/api/products?isFeatured=true&limit=8"] });
  const { data: categoryData } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const products = asArray<Product>(featuredData);
  const categories = asArray<Category>(categoryData);

  return <div className="min-h-screen storefront">
    <Header />
    <main id="main-content">
      <section className="collection-hero" data-testid="hero-section">
        <StoreImage src="/images/hero-banner.jpg" alt="Silhouette ELEGANCE en tenue écrue, dans un décor ensoleillé" loading="eager" fetchPriority="high" className="hero-photo" />
        <div className="hero-shade" />
        <div className="store-container relative z-10 w-full py-20">
          <p className="eyebrow text-white/90 mb-7">L’art de s’habiller, simplement</p>
          <h1 className="editorial-title text-white max-w-xl">L’élégance.<br />Tout naturellement.</h1>
          <p className="text-base md:text-lg text-white/90 max-w-md mt-7 mb-9 leading-relaxed">Des pièces à aimer, des détails à remarquer.<br className="hidden sm:block" /> Découvrez une nouvelle façon d’exprimer votre style.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="store-cta bg-white text-stone-900" data-testid="hero-discover-collection">Découvrir la collection <ArrowRight size={17} /></Link>
            <Link href="/products?promo=true" className="store-cta border border-white/70 text-white hover:bg-white/10" data-testid="hero-view-promotions">Voir les promotions</Link>
          </div>
        </div>
        <a href="#inspirations" className="hero-explore" aria-label="Explorer les inspirations">Explorer <ArrowDown size={15} /></a>
        <span className="hero-caption">ELEGANCE / LA COLLECTION</span>
      </section>

      <div className="service-ribbon">
        <Link href="/livraison"><Truck size={20} /><span>Livraison offerte dès 150 TND</span></Link>
        <Link href="/retours"><RotateCcw size={20} /><span>Retours sous 14 jours</span></Link>
        <Link href="/contact"><MessageCircle size={20} /><span>Une équipe à votre écoute</span></Link>
      </div>

      <section id="inspirations" className="store-container section-space" data-testid="featured-categories">
        <div className="section-heading"><div><p className="eyebrow">À chaque envie, son style</p><h2>Le carnet d’inspiration</h2></div><Link href="/products" className="text-link">Toute la collection <ArrowRight size={16} /></Link></div>
        <div className="inspiration-grid">
          {inspirations.map((item, index) => <Link href={item.href} key={item.title} className="inspiration-card group">
            <div className="inspiration-photo"><StoreImage src={item.image} alt={item.title} width={500} height={685} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="photo-number">0{index + 1}</span></div>
            <div className="flex justify-between items-center gap-4 pt-5"><div><h3>{item.title}</h3><p className="text-sm text-stone-500 mt-2">{item.subtitle}</p></div><ArrowRight size={22} aria-label={item.label} /></div>
          </Link>)}
        </div>
        {categories.length > 0 && <nav aria-label="Collections disponibles" className="flex flex-wrap gap-3 mt-9">{categories.map(category => <Link key={category.id} href={`/products?categoryId=${category.id}`} className="category-pill">{category.name} <ArrowRight size={14} /></Link>)}</nav>}
      </section>

      <section className="bg-[#f6f3ee] section-space" data-testid="featured-products"><div className="store-container">
        <div className="section-heading"><div><p className="eyebrow">La sélection ELEGANCE</p><h2>À découvrir maintenant</h2></div><Link href="/products?featured=true" className="text-link" data-testid="view-all-featured">Voir les nouveautés <ArrowRight size={16} /></Link></div>
        {isLoading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Chargement des nouveautés">{[1,2,3,4].map(i => <div key={i} className="h-80 bg-stone-200 animate-pulse" />)}</div> : isError ? <div className="catalog-notice" role="status"><p>Les nouveautés sont momentanément indisponibles.</p><Button variant="outline" onClick={() => refetch()}>Réessayer</Button></div> : products.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-notice"><p>La prochaine sélection se prépare. Explorez les pièces déjà disponibles.</p><Link href="/products" className="text-link">Parcourir le catalogue <ArrowRight size={16}/></Link></div>}
      </div></section>

      <section className="store-container section-space"><div className="brand-story">
        <div className="brand-image"><StoreImage src="/images/hero-banner.jpg" alt="Détails d’une silhouette écrue de la collection" className="w-full h-full object-cover" /></div>
        <div className="brand-copy"><p className="eyebrow">L’esprit ELEGANCE</p><h2>Votre style.<br />Votre signature.</h2><p className="text-stone-600 leading-relaxed my-7">Un vestiaire qui laisse place à votre personnalité. Des silhouettes faciles à associer, pour les jours ordinaires comme pour les moments qui comptent.</p><Link href="/la-marque" className="text-link">Découvrir notre univers <ArrowRight size={16} /></Link></div>
      </div></section>

      <section className="bg-[#ece6dc] py-16"><div className="store-container flex flex-col md:flex-row md:items-center justify-between gap-8"><div><p className="eyebrow">Les belles trouvailles</p><h2 className="font-serif text-3xl md:text-4xl mt-3">Une nouvelle pièce, un prix plus doux.</h2><p className="text-stone-600 mt-4">Retrouvez les offres disponibles dans notre sélection.</p></div><Link href="/products?promo=true" className="store-cta bg-stone-900 text-white shrink-0 self-start md:self-auto" data-testid="promo-discover-sales">Explorer les promotions <ArrowRight size={17} /></Link></div></section>

      <section className="store-container section-space"><div className="section-heading"><div><p className="eyebrow">On vous accompagne</p><h2>Un shopping à votre rythme</h2></div></div>
        <div className="shopping-help-grid">
          <div><Ruler size={25}/><h3>La bonne coupe, pour vous</h3><p>Quelques conseils pour prendre vos mesures et choisir votre pièce.</p><SizeGuide /></div>
          <div><Heart size={25}/><h3>Gardez vos coups de cœur</h3><p>Enregistrez vos pièces préférées et retrouvez-les dans vos favoris.</p><Link href="/wishlist" className="text-link">Mes favoris <ArrowRight size={16}/></Link></div>
          <div><MessageCircle size={25}/><h3>Une question ?</h3><p>Livraison, retours ou commande : retrouvez les réponses utiles.</p><Link href="/faq" className="text-link">Consulter la FAQ <ArrowRight size={16}/></Link></div>
        </div>
        <div className="mt-14 space-y-0 border-t border-stone-200">
          <details className="store-faq"><summary>Comment suivre ma commande ?</summary><p>Connectez-vous à votre compte, puis ouvrez « Mes commandes » pour retrouver le suivi de votre commande. <Link href="/orders" className="underline">Voir mes commandes</Link></p></details>
          <details className="store-faq"><summary>Quelles sont les conditions de livraison ?</summary><p>La livraison est offerte dès 150 TND d’achat. Retrouvez les informations et conditions sur notre <Link href="/livraison" className="underline">page livraison</Link>.</p></details>
          <details className="store-faq"><summary>Comment demander un retour ?</summary><p>Consultez les conditions de retour sous 14 jours sur la <Link href="/retours" className="underline">page retours</Link> ou <Link href="/contact" className="underline">contactez-nous</Link> pour être accompagné.</p></details>
        </div>
      </section>
    </main>
    <Footer />
  </div>;
}
