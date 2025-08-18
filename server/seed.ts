import { getDrizzleDb } from "./db";
import { products, categories } from "../shared/schema"; // ← Bien vérifier le chemin

async function seed() {
  try {
    const db = getDrizzleDb();
    // Supprimer les anciens enregistrements (produits avant catégories à cause des contraintes FK)
    await db.delete(products);
    await db.delete(categories);

    // Insérer des catégories principales alignées avec la navigation
    await db.insert(categories).values([
      { name: "Robes", slug: "robes", isActive: true },
      { name: "Chemises", slug: "chemises", isActive: true },
      { name: "Jupes", slug: "jupes", isActive: true },
      { name: "Combinaisons", slug: "combinaisons", isActive: true },
      { name: "Manteaux & Trenchs", slug: "manteaux-trenchs", isActive: true },
      { name: "Shorts", slug: "shorts", isActive: true },
    ]);

    // Insérer un produit exemple
    await db.insert(products).values({
      name: "Robe Élégante",
      slug: "robe-elegante",
      price: "89.99",
      salePrice: "79.99",
      sku: "ROBE-001",
      stockQuantity: 15,
      categoryId: 1, // correspond à la catégorie "Robes"
      isActive: true,
      isFeatured: true,
      images: ["https://via.placeholder.com/300"],
      sizes: ["S", "M", "L"],
      colors: ["Rouge", "Noir"],
      tags: ["soirée", "élégant"],
      shortDescription: "Une robe idéale pour les occasions spéciales.",
      description: "Cette robe élégante offre une coupe flatteuse et un tissu de qualité supérieure.",
      averageRating: "4.5",
      reviewsCount: 12,
    });

    console.log("✅ Seed terminé avec succès");
  } catch (err) {
    console.error("❌ Erreur seed:", err);
  }
}

seed();
