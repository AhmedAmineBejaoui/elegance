import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingBag, Menu, LogIn, UserCircle, Package, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { CartModal } from "@/components/cart/cart-modal";
import type { CartItem, Product } from "@shared/schema";
import { useFavorites } from "@/hooks/useFavorites";
import useDebounce from "@/hooks/useDebounce";

export function Header() {
  const [location , navigate] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { isAuthenticated, user } = useAuth();
  const { favorites } = useFavorites();
  const { data: suggestions = [] } = useQuery<Product[]>({
    queryKey: [`/api/products?search=${encodeURIComponent(debouncedSearch)}&limit=5`],
    enabled: debouncedSearch.length > 0,
  });

  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((sum: number, item) => sum + item.quantity, 0);

  const navigation = [
    { name: "NOUVEAUTÉS", href: "/products?featured=true", highlight: true },

    {
      name: "FEMME",
      items: [
        { name: "ROBES", href: "/robes" },
        { name: "CHEMISES", href: "/chemises" },
        { name: "JUPES", href: "/jupes" },
        { name: "COMBINAISONS", href: "/combinaisons" },
      ],
    },
    {
      name: "HOMME",
      items: [
        { name: "MANTEAUX & TRENCHS", href: "/manteaux-trenchs" },
        { name: "SHORTS", href: "/shorts" },
      ],

    },
  ];


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm" data-testid="header">
        {/* Announcement bar */}
        <div className="bg-foreground text-background text-xs text-center py-2 px-4">
          Livraison offerte dès 150 TND d'achat
        </div>

        {/* Main Navigation */}
        <nav className="border-b border-border">
          <div className="flex items-center justify-between py-4 px-4 md:px-8">


          {/* Logo */}
            <Link href="/" className="flex-1 " data-testid="logo">
              <h1 className="text-2xl font-light tracking-wide text-foreground">ELEGANCE</h1>
            </Link>

            {/* Desktop Search */}
            <div className="flex-1 hidden md:block max-w-xs">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-md mt-1 z-50">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setSearchTerm("")}
                      >
                        <div className="px-3 py-2 hover:bg-accent cursor-pointer">
                          {product.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            </div>

            

            {/* Action Icons */}
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                data-testid="search-button"
              >
                <Search className="h-4 w-4" />
              </Button>

              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-muted-foreground hover:text-foreground"
                  data-testid="wishlist-button"
                >
                  <Heart className="h-4 w-4" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                      {favorites.length}
                    </span>
                  )}
                </Button>
              </Link>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCartOpen(true)}
                  data-testid="cart-button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              )}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Mes commandes</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Administration</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => (window.location.href = `${API_BASE}/api/logout`)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Se connecter</span>
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden" data-testid="mobile-menu-button">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      item.items ? (
                        <div key={item.name} className="space-y-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </span>
                          <div className="flex flex-col ml-4 space-y-2">
                            {item.items.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className={`text-lg font-medium transition-colors ${
                                  location === sub.href
                                    ? "text-primary"
                                    : "text-gray-700 hover:text-primary"
                                }`}
                                data-testid={`mobile-nav-${sub.name.toLowerCase()}`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href!}
                          className={`text-lg font-medium transition-colors ${
                            location === item.href
                              ? "text-primary"
                              : item.highlight
                              ? "text-red-500"
                              : "text-gray-700 hover:text-primary"
                          }`}
                          data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                        >
                          {item.name}
                        </Link>
                      )
                    ))}

                    {user?.role === 'admin' && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Administration</h3>
                        <Link href="/admin" className="text-lg font-medium text-gray-700 hover:text-primary">
                          Dashboard Admin
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center space-x-8 py-2">
            {navigation.map((item) => (
              item.items ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger
                    className={`text-sm font-light tracking-wide transition-colors ${
                      item.items.some((sub) => location === sub.href)
                        ? "text-foreground border-b border-foreground pb-1"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.items.map((sub) => (
                      <DropdownMenuItem key={sub.name} asChild>
                        <Link href={sub.href}>{sub.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-light tracking-wide transition-colors ${
                    location === item.href
                      ? "text-foreground border-b border-foreground pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </nav>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-4 border-b border-border">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full focus:ring-2 focus:ring-primary"
                data-testid="mobile-search-input"
              />
              <Button
               type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                data-testid="mobile-search-submit"
              >
                <Search className="h-4 w-4" />
              </Button>
            {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-md mt-1 z-50">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setSearchTerm("");
                        setIsSearchOpen(false);
                      }}
                    >
                      <div className="px-3 py-2 hover:bg-accent cursor-pointer">
                        {product.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}