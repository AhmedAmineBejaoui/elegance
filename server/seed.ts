import { db } from "./db";
import { products, categories } from "../shared/schema"; // ← Bien vérifier le chemin

async function seed() {
  try {
    // Supprimer les anciens enregistrements (produits avant catégories à cause des contraintes FK)
    await db.delete(products);
    await db.delete(categories);

    // Insérer des catégories
    await db.insert(categories).values([
      { name: "T-shirts", slug: "t-shirts", isActive: true },
      { name: "Shoes", slug: "shoes", isActive: true },
    ]);

    // Insérer un produit exemple
    await db.insert(products).values({
      name: "Basic Tee",
      slug: "basic-tee",
      price: "45.99",
      salePrice: "39.99",
      sku: "BTEE-001",
      stockQuantity: 20,
      categoryId: 1,
      isActive: true,
      isFeatured: true,
      images: ["https://via.placeholder.com/300"],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Noir", "Blanc"],
      tags: ["été", "casual"],
      shortDescription: "T-shirt basique parfait pour l'été.",
      description: "Un t-shirt basique confortable, idéal pour un usage quotidien.",
      rating: "4.5",
      reviewCount: 12,
    });

    console.log("✅ Seed terminé avec succès");
  } catch (err) {
    console.error("❌ Erreur seed:", err);
  }
}

seed();
