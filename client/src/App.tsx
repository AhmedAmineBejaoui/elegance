// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import About from "@/pages/about";
import Boutiques from "@/pages/boutiques";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Livraison from "@/pages/livraison";
import Retours from "@/pages/retours";
import ManteauxTrenchs from "@/pages/manteaux-trenchs";
import Robes from "@/pages/robes";
import Chemises from "@/pages/chemises";
import Jupes from "@/pages/jupes";
import ShortsPage from "@/pages/shorts";
import Combinaisons from "@/pages/combinaisons";
import CGV from "@/pages/cgv";
import MentionsLegales from "@/pages/mentions-legales";
import DonneesPersonnelles from "@/pages/donnees-personnelles";
import NousRejoindre from "@/pages/nous-rejoindre";
import LaMarque from "@/pages/la-marque";
import Wishlist from "@/pages/wishlist";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import ProfilePage from "./pages/profile";
import AuthPage from "./pages/auth";
import Orders from "@/pages/orders";
import OrderTracking from "@/pages/order-tracking";


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
