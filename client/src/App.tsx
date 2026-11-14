import { lazy, Suspense } from "react";
// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
const NotFound = lazy(() => import("@/pages/not-found"));
import Home from "@/pages/home";
const Products = lazy(() => import("@/pages/products"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const About = lazy(() => import("@/pages/about"));
const Boutiques = lazy(() => import("@/pages/boutiques"));
const FAQ = lazy(() => import("@/pages/faq"));
const Contact = lazy(() => import("@/pages/contact"));
const Livraison = lazy(() => import("@/pages/livraison"));
const Retours = lazy(() => import("@/pages/retours"));
const ManteauxTrenchs = lazy(() => import("@/pages/manteaux-trenchs"));
const Robes = lazy(() => import("@/pages/robes"));
const Chemises = lazy(() => import("@/pages/chemises"));
const Jupes = lazy(() => import("@/pages/jupes"));
const ShortsPage = lazy(() => import("@/pages/shorts"));
const Combinaisons = lazy(() => import("@/pages/combinaisons"));
const CGV = lazy(() => import("@/pages/cgv"));
const MentionsLegales = lazy(() => import("@/pages/mentions-legales"));
const DonneesPersonnelles = lazy(() => import("@/pages/donnees-personnelles"));
const NousRejoindre = lazy(() => import("@/pages/nous-rejoindre"));
const LaMarque = lazy(() => import("@/pages/la-marque"));
const Wishlist = lazy(() => import("@/pages/wishlist"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminCustomers = lazy(() => import("@/pages/admin/customers"));
const ProfilePage = lazy(() => import("./pages/profile"));
const AuthPage = lazy(() => import("./pages/auth"));
const Orders = lazy(() => import("@/pages/orders"));
const OrderTracking = lazy(() => import("@/pages/order-tracking"));


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading && /^\/(admin|profile|orders)(\/|$)/.test(window.location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/about" component={About} />
      <Route path="/boutiques" component={Boutiques} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/livraison" component={Livraison} />
      <Route path="/retours" component={Retours} />
      <Route path="/manteaux-trenchs" component={ManteauxTrenchs} />
      <Route path="/robes" component={Robes} />
      <Route path="/chemises" component={Chemises} />
      <Route path="/jupes" component={Jupes} />
      <Route path="/shorts" component={ShortsPage} />
      <Route path="/combinaisons" component={Combinaisons} />
      <Route path="/cgv" component={CGV} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/donnees-personnelles" component={DonneesPersonnelles} />
      <Route path="/nous-rejoindre" component={NousRejoindre} />
      <Route path="/la-marque" component={LaMarque} />

      {isAuthenticated && (
        <>
          <Route path="/profile" component={ProfilePage} />
          <Route path="/orders/:id" component={OrderTracking} />
          <Route path="/orders" component={Orders} />
        </>
      )}

      {isAuthenticated && user?.role === 'admin' && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/customers" component={AdminCustomers} />
        </>
      )}

      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense fallback={<div className="min-h-[60vh] grid place-items-center" role="status">Chargement…</div>}><Router /></Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
