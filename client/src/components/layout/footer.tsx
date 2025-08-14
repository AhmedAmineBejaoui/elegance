// components/Footer.tsx

import { Lock, Truck, RotateCcw, Headphones, Instagram, Facebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Adresse email invalide");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 409) {
        throw new Error(data.message || "Cet email est déjà inscrit");
      }
      if (!res.ok) throw new Error(data.message || "Une erreur s'est produite");
      setStatus("success");
      setMessage(data.message || "Merci pour votre inscription !");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/status"] });
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Une erreur s'est produite");
    }
  };

  return (
    <footer className="bg-white border-t text-sm text-black">
      {/* Top Icons Row */}
      <div className="bg-black text-white py-4 px-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-xs">
        <div>
          <Lock className="mx-auto mb-1 h-5 w-5" />
          <strong className="block">PAIEMENT SÉCURISÉ</strong>
          <p>Paiement sécurisé par carte bancaire</p>
        </div>
        <div>
          <Truck className="mx-auto mb-1 h-5 w-5" />
          <strong className="block">LIVRAISON GRATUITE</strong>
          <p>Offerte à partir de 150 DT d'achats</p>
        </div>
        <div>
          <RotateCcw className="mx-auto mb-1 h-5 w-5" />
          <strong className="block">RETOURS</strong>
          <p>Retour sous 14 jours</p>
        </div>
        <div>
          <Headphones className="mx-auto mb-1 h-5 w-5" />
          <strong className="block">SERVICE CLIENT</strong>
          <p>
            <a href="/contact" className="underline">Contactez-nous</a>. Consultez notre <a href="/faq" className="underline">FAQ</a>.
          </p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="text-center py-8 px-4">
        <h2 className="text-2xl font-bold mb-1">INSCRIVEZ-VOUS</h2>
        <p className="text-gray-700 mb-4">Abonnez-vous à notre newsletter afin de recevoir nos dernières collections et nos offres.</p>
        <form onSubmit={handleSubmit} className="flex justify-center max-w-md mx-auto">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Saisir votre adresse email"
            className="rounded-none border-black"
          />
          <Button type="submit" className="rounded-none bg-black text-white px-6">
            S'INSCRIRE
          </Button>
        </form>
        {status !== "idle" && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 px-6 py-10 text-gray-800">
        <div>
          <h3 className="font-bold mb-2">SERVICES</h3>
          <ul className="space-y-1">
            <li><a href="/boutiques">Nos boutiques</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/livraison">Livraison</a></li>
            <li><a href="/retours">Retours</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">SÉLECTIONS</h3>
          <ul className="space-y-1">
            <li><a href="/manteaux-trenchs">Manteaux & Trenchs</a></li>
            <li><a href="/robes">Robes</a></li>
            <li><a href="/chemises">Chemises</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">SÉLECTIONS</h3>
          <ul className="space-y-1">
            <li><a href="/jupes">Jupes</a></li>
            <li><a href="/shorts">Shorts</a></li>
            <li><a href="/combinaisons">Combinaisons</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">INFORMATIONS</h3>
          <ul className="space-y-1">
            <li><a href="/cgv">CGV</a></li>
            <li><a href="/mentions-legales">Mentions légales</a></li>
            <li><a href="/donnees-personnelles">Données personnelles</a></li>
            <li><a href="/nous-rejoindre">Nous rejoindre</a></li>
          </ul>
        </div>
        <div>
          
          
        </div>
        <div>
          <h3 className="font-bold mb-2">PAGES</h3>
          <ul className="space-y-1">
            <li><a href="/">Accueil</a></li>
            <li><a href="/products">Produits</a></li>
            <li><a href="/about">À propos</a></li>
            <li><a href="/cart">Panier</a></li>
            <li><a href="/checkout">Paiement</a></li>
            <li><a href="/wishlist">Favoris</a></li>
            <li><a href="/profile">Profil</a></li>
            <li><a href="/orders">Commandes</a></li>
            <li><a href="/auth">Connexion</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs">
        <div className="mb-2 md:mb-0 font-semibold">ELEGANCE © 2025 </div>
        <div className="flex space-x-6">
          <a href="#" className="flex items-center gap-1"><Instagram className="w-4 h-4" /> INSTAGRAM</a>
          <a href="#" className="flex items-center gap-1"><Facebook className="w-4 h-4" /> FACEBOOK</a>

        </div>
      </div>
    </footer>
  );
}
