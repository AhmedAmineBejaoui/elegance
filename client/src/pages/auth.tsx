import { useEffect, useState } from "react";
import { Shield, Lock, User, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { API_BASE } from "@/lib/api";

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: any) => {
    // Use absolute API paths to avoid relative URL issues
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Se connecter" : "S'inscrire"}
          </CardTitle>
          <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
            <Shield className="w-4 h-4" />
            <span>Vos données sont protégées</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {mode === "register" && (
                <div className="flex space-x-2">
                  <Input
                    {...register("firstName")}
                    placeholder="Prénom"
                    className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <Input
                    {...register("lastName")}
                    placeholder="Nom"
                    className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Adresse e-mail :</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="Entrez votre email"
                    className="pl-10 h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mot de passe :</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Votre mot de passe"
                    className="pl-10 h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium">
                {mode === "login" ? "SE CONNECTER" : "S'INSCRIRE"}
              </Button>
            </form>

            <div className="text-center text-sm">
              {mode === "login" ? (
                <span>
                  Pas de compte ?{" "}
                  <button className="text-pink-600 hover:underline" onClick={() => setMode("register")}>S'inscrire</button>
                </span>
              ) : (
                <span>
                  Vous avez déjà un compte ?{" "}
                  <button className="text-pink-600 hover:underline" onClick={() => setMode("login")}>Se connecter</button>
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
              Ou
            </span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => (window.location.href = `${API_BASE}/api/login`)}
              variant="outline"
              className="w-full h-12 border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center space-x-2">
                <FcGoogle className="w-5 h-5" />
                <span>Continuer avec Google</span>
              </div>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              En continuant, vous acceptez nos{" "}
              <Link href="/terms" className="text-pink-600 hover:underline">
                Conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy" className="text-pink-600 hover:underline">
                Politique de confidentialité
              </Link>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Paiement sécurisé SSL</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

