import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  FolderTree,
  LogOut,
  Eye,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_BASE, asArray } from "@/lib/api";

// ---------- Types ----------
interface AdminStats {
  totalOrders: number;
  totalRevenue: number; // number in DT
  totalProducts: number;
  totalCustomers: number;
  completedOrders: number;
  pendingOrders: number;
  salesByMonth?: Array<{ month: string; thisYear: number; lastYear: number }>;
  ordersByChannel?: Array<{ channel: string; value: number }>;
}

interface OrderRow {
  id: string | number;
  orderNumber: string;
  createdAt: string | number | Date;
  total: string | number;
  status: "pending" | "processing" | "delivered" | "shipped" | string;
}

// Palette helpers
const SERIES = [
  "#2563eb", // blue-600
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
];

const statusVariant: Record<string, { label: string; className: string }> = {
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  shipped: { label: "Expédiée", className: "bg-blue-100 text-blue-700" },
  processing: { label: "En traitement", className: "bg-cyan-100 text-cyan-700" },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700" },
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // ---- Auth guard ----
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => (window.location.href = "/"), 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // ---- Data fetching ----
  const { data: stats = {} as AdminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: recentOrdersData = [], isLoading: ordersLoading } = useQuery<OrderRow[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: lowStockProductsData = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?lowStock=true"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const recentOrders = asArray<OrderRow>(recentOrdersData);
  const lowStockProducts = asArray<Product>(lowStockProductsData);

  const salesSeries = stats?.salesByMonth ?? [];

  const channels = useMemo(() => {
    const base = stats?.ordersByChannel ?? [];
    const total = base.reduce((a, b) => a + b.value, 0);
    return base.map((c) => ({ ...c, pct: total ? Math.round((c.value / total) * 100) : 0 }));
  }, [stats?.ordersByChannel]);

  // ---- UI Bits ----
  if (isLoading || (!isAuthenticated || user?.role !== "admin")) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total des commandes",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
    },
    {
      title: "Revenus totaux",
      value: `${typeof stats?.totalRevenue === "number" ? stats.totalRevenue.toFixed(2) : "0.00"} DT`,
      icon: DollarSign,
    },
    {
      title: "Produits",
      value: stats?.totalProducts ?? 0,
      icon: Package,
    },
    {
      title: "Clients",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
    },
  ];

  const orderStatusData = [
    { name: "Livrées", value: stats?.completedOrders || 0 },
    { name: "En attente", value: stats?.pendingOrders || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 bg-gray-900 text-white flex-col">
          <div className="p-6 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">Elegance</p>
                <p className="text-xs text-gray-400 -mt-1">Admin Dashboard</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SideLink href="/admin" icon={<BarChart2 className="h-5 w-5" />}>Tableau de bord</SideLink>
            <SideLink href="/admin/products" icon={<Package className="h-5 w-5" />}>Produits</SideLink>
            <SideLink href="/admin/categories" icon={<FolderTree className="h-5 w-5" />}>Catégories</SideLink>
            <SideLink href="/admin/orders" icon={<ShoppingCart className="h-5 w-5" />}>Commandes</SideLink>
            <SideLink href="/admin/customers" icon={<Users className="h-5 w-5" />}>Clients</SideLink>
          </nav>
          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.profileImageUrl || "/placeholder-avatar.jpg"}
                alt="Admin"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Tableau de bord</h1>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline"><Link href="/"><Eye className="mr-2 h-4 w-4"/>Voir le site</Link></Button>
                <Button variant="outline" onClick={() => (window.location.href = `${API_BASE}/api/logout`)}> <LogOut className="mr-2 h-4 w-4"/>Déconnexion</Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* KPI cards */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              {statCards.map((s, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs font-medium">{s.title}</p>
                          <div className="mt-1">
                            <span className="text-2xl font-semibold">{s.value}</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <s.icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Sales + Channels */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5"/>Ventes – Cette année vs l'an dernier</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[320px]">
                    {statsLoading ? (
                      <SkeletonChart />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesSeries} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gThis" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gLast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={SERIES[2]} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={SERIES[2]} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="thisYear" name="Cette année" stroke={SERIES[0]} fill="url(#gThis)" strokeWidth={2} />
                          <Area type="monotone" dataKey="lastYear" name="L'an dernier" stroke={SERIES[2]} fill="url(#gLast)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5"/>Répartition des commandes</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[320px]">
                    {statsLoading ? (
                      <SkeletonChart />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip />
                          <Legend />
                          <Pie data={channels} dataKey="value" nameKey="channel" innerRadius={65} outerRadius={110} paddingAngle={3}>
                            {channels.map((_, idx) => (
                              <Cell key={idx} fill={SERIES[idx % SERIES.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {channels.map((c, i) => (
                      <div key={i} className="rounded-lg border p-2 flex items-center justify-between">
                        <span className="truncate">{c.channel}</span>
                        <span className="font-semibold">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders status + Recent orders + Low stock */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-1">
                <CardHeader className="pb-2"><CardTitle>Statut des commandes</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[260px]">
                    {statsLoading ? (
                      <SkeletonChart />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {orderStatusData.map((_, idx) => (
                              <Cell key={idx} fill={SERIES[idx % SERIES.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Commandes récentes</CardTitle>
                  <Link href="/admin/orders"><Button variant="outline" size="sm">Voir tout</Button></Link>
                </CardHeader>
                <CardContent className="pt-0">
                  {ordersLoading ? (
                    <ListSkeleton rows={5} />
                  ) : recentOrders.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">Aucune commande récente</p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="text-left p-3">ID</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-right p-3">Total</th>
                            <th className="text-right p-3">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {asArray(recentOrders).slice(0, 7).map((o) => (
                            <tr key={String(o.id)} className="border-t hover:bg-muted/40 transition-colors">
                              <td className="p-3 font-medium">#{o.orderNumber}</td>
                              <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 text-right font-semibold">{Number(o.total).toFixed(2)} DT</td>
                              <td className="p-3 text-right">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  statusVariant[o.status]?.className || "bg-gray-100 text-gray-700"
                                }`}>
                                  {statusVariant[o.status]?.label || o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Low Stock */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/>Stock faible</CardTitle>
                  <Link href="/admin/products"><Button variant="outline" size="sm">Gérer</Button></Link>
                </CardHeader>
                <CardContent className="pt-0">
                  {productsLoading ? (
                    <ListSkeleton rows={5} />
                  ) : lowStockProducts.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">Aucun produit en stock faible</p>
                  ) : (
                    <ul className="space-y-3">
                      {asArray(lowStockProducts).slice(0, 6).map((p) => (
                        <li key={String(p.id)} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || "/placeholder-product.jpg"} alt={p.name} className="h-10 w-10 rounded object-cover" />
                            <div>
                              <p className="font-medium leading-tight">{p.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">{p.stockQuantity} restant{(p as any).stockQuantity > 1 ? "s" : ""}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-2"><CardTitle>Actions rapides</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0">
                <Link href="/admin/products"><Button className="w-full justify-start" variant="outline"><Package className="mr-2 h-4 w-4"/>Ajouter un produit</Button></Link>
                <Link href="/admin/categories"><Button className="w-full justify-start" variant="outline"><FolderTree className="mr-2 h-4 w-4"/>Ajouter une catégorie</Button></Link>
                <Link href="/admin/orders"><Button className="w-full justify-start" variant="outline"><ShoppingCart className="mr-2 h-4 w-4"/>Voir les commandes</Button></Link>
                <Link href="/admin/customers"><Button className="w-full justify-start" variant="outline"><Users className="mr-2 h-4 w-4"/>Gérer les clients</Button></Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------- Small components ----------
function SideLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

function SkeletonChart() {
  return (
    <div className="h-full w-full">
      <div className="h-full animate-pulse rounded-xl bg-gradient-to-b from-muted/60 to-muted" />
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
