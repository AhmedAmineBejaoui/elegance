import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // champ honey-pot caché
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !message) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");

      setSuccess("Message envoyé avec succès. Nous vous répondrons rapidement.");
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section
        className="relative h-60 flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl font-bold">Contact</h1>
      </section>

      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Une question sur votre commande ou sur nos produits ? Envoyez-nous un message,
          notre équipe vous répondra rapidement.
        </p>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nom</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" required />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message" required />
              </div>

              {/* Honeypot caché */}
              <div className="hidden">
                <label htmlFor="website">Website</label>
                <Input id="website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Envoi…" : "Envoyer"}
              </Button>

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm" aria-live="polite">
                  <CheckCircle2 className="h-4 w-4" /> {success}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm" aria-live="assertive">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-gray-600 text-center">
          Vous pouvez également nous écrire à
          <a href="mailto:casadelmarguesthouse@gmail.com" className="text-primary underline mx-1 inline-flex items-center gap-1">
            <Mail className="h-4 w-4" /> casadelmarguesthouse@gmail.com
          </a>
        </p>
      </main>

      <Footer />
    </div>
  );
}