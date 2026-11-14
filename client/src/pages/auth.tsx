import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Heart, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreImage } from "@/components/ui/store-image";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { API_BASE } from "@/lib/api";

interface AuthFields {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AuthFields>({ shouldUnregister: true });
  const isLogin = mode === "login";

  useEffect(() => {
    if (isAuthenticated) window.location.replace("/");
  }, [isAuthenticated]);

  const changeMode = (nextMode: typeof mode) => {
    if (isSubmitting || mode === nextMode) return;
    reset();
    setSubmitError("");
    setShowPassword(false);
    setMode(nextMode);
  };

  const onSubmit = async (data: AuthFields) => {
    setSubmitError("");
    try {
      const response = await fetch(`${API_BASE}${isLogin ? "/api/auth/login" : "/api/auth/register"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, email: data.email.trim() }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        window.location.assign("/");
        return;
      }
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setSubmitError("L’adresse e-mail ou le mot de passe est incorrect. Réessayez.");
      } else if (!isLogin && (response.status === 409 || body.message === "Email already in use")) {
        setSubmitError("Cette adresse e-mail possède déjà un compte. Connectez-vous pour le retrouver.");
      } else {
        setSubmitError(isLogin ? "Impossible de vous connecter pour le moment. Veuillez réessayer dans quelques instants." : "Impossible de créer votre compte pour le moment. Veuillez réessayer dans quelques instants.");
      }
    } catch {
      setSubmitError("La connexion n’a pas abouti. Vérifiez votre connexion Internet et réessayez.");
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="auth-page">
      <a href="#auth-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4">Aller au formulaire</a>
      <header className="auth-header">
        <Link href="/" className="auth-wordmark" aria-label="ELEGANCE, accueil">ELEGANCE<span>LE STYLE, NATURELLEMENT</span></Link>
        <Link href="/" className="auth-back"><ArrowLeft size={15} /><span>Retour à la boutique</span></Link>
      </header>

      <main id="auth-main" className="auth-layout">
        <section className="auth-editorial" aria-label="L’univers ELEGANCE">
          <StoreImage src="/images/hero-banner.jpg" alt="Silhouette ELEGANCE en tenue écrue sous le soleil" loading="eager" className="auth-photo" />
          <div className="auth-photo-overlay" />
          <div className="auth-editorial-top"><span>LA COLLECTION ELEGANCE</span><span className="auth-monogram" aria-hidden="true">é</span></div>
          <div className="auth-editorial-copy">
            <span className="auth-gold-line" />
            <p className="eyebrow">Votre allure, votre signature</p>
            <h2>Le style commence<br />par <em>vous.</em></h2>
            <p>Un espace à vous, pour retrouver vos envies<br className="hidden sm:block" /> et écrire la suite de votre style.</p>
            <Link href="/products" className="auth-editorial-link">Explorer la collection <ArrowRight size={17} /></Link>
          </div>
          <span className="auth-editorial-caption">DES PIÈCES À AIMER. DES DÉTAILS À REMARQUER.</span>
        </section>

        <section className="auth-form-panel" aria-labelledby="auth-title">
          <div className="auth-form-wrap">
            <div className="auth-welcome-mark" aria-hidden="true"><span>é</span></div>
            <p className="eyebrow auth-section-label">Votre espace ELEGANCE</p>
            <h1 id="auth-title">{isLogin ? "Heureux de vous revoir." : "L’élégance vous attend."}</h1>
            <p className="auth-intro">{isLogin ? "Retrouvez vos coups de cœur et vos commandes." : "Créez votre compte et faites place à vos envies."}</p>

            <div className={`auth-mode-switch ${isLogin ? "" : "is-register"}`} role="group" aria-label="Choisir la connexion ou l’inscription">
              <span className="auth-mode-indicator" aria-hidden="true" />
              <button type="button" aria-pressed={isLogin} disabled={isSubmitting} onClick={() => changeMode("login")}>Se connecter</button>
              <button type="button" aria-pressed={!isLogin} disabled={isSubmitting} onClick={() => changeMode("register")}>Créer un compte</button>
            </div>

            <form key={mode} className="auth-form-enter" noValidate onSubmit={handleSubmit(onSubmit)} aria-label={isLogin ? "Connexion" : "Inscription"} aria-busy={isSubmitting}>
              {submitError && <p className="auth-error-summary" role="alert">{submitError}</p>}
              {!isLogin && <div className="auth-name-fields">
                <div className="auth-field"><label htmlFor="auth-first-name">Prénom <span className="auth-optional">(facultatif)</span></label><Input id="auth-first-name" autoComplete="given-name" placeholder="Votre prénom" {...register("firstName")} disabled={isSubmitting} className="auth-input" /></div>
                <div className="auth-field"><label htmlFor="auth-last-name">Nom <span className="auth-optional">(facultatif)</span></label><Input id="auth-last-name" autoComplete="family-name" placeholder="Votre nom" {...register("lastName")} disabled={isSubmitting} className="auth-input" /></div>
              </div>}

              <div className="auth-field">
                <label htmlFor="auth-email">Adresse e-mail</label>
                <div className="auth-input-wrap"><Mail size={17} aria-hidden="true" /><Input id="auth-email" required type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" placeholder="vous@exemple.com" disabled={isSubmitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "auth-email-error" : undefined} className="auth-input auth-input-with-icon" {...register("email", { required: "Indiquez votre adresse e-mail.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Indiquez une adresse e-mail valide." } })} /></div>
                {errors.email && <p id="auth-email-error" className="auth-field-error" role="alert">{errors.email.message}</p>}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Mot de passe</label>
                <div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><Input id="auth-password" required type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Votre mot de passe" : "Choisissez votre mot de passe"} disabled={isSubmitting} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "auth-password-error" : undefined} className="auth-input auth-input-with-icon auth-password-input" {...register("password", { required: "Indiquez votre mot de passe." })} /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} disabled={isSubmitting} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
                {errors.password && <p id="auth-password-error" className="auth-field-error" role="alert">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Un instant…</> : <>{isLogin ? "Me connecter" : "Créer mon compte"}<ArrowRight size={18} /></>}
              </Button>
            </form>

            <div className="auth-divider"><span />ou continuer avec<span /></div>
            <Button type="button" variant="outline" className="auth-google" disabled={isSubmitting} onClick={() => window.location.assign(`${API_BASE}/api/login`)}><FcGoogle size={20} />Google</Button>

            <p className="auth-legal">En continuant, vous acceptez nos <Link href="/cgv">conditions générales</Link> et notre <Link href="/donnees-personnelles">politique de confidentialité</Link>.</p>
            <div className="auth-reassurance"><ShieldCheck size={16} /><span>Votre espace personnel, en toute confiance.</span></div>
          </div>
          <div className="auth-panel-benefits"><span><Heart size={14} />Vos favoris</span><span><Check size={14} />Vos commandes</span><span><LockKeyhole size={14} />Votre compte</span></div>
        </section>
      </main>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} ELEGANCE</span><span>Une question ? <Link href="/contact">Écrivez-nous</Link></span></footer>
    </div>
  );
}
