import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "En attente";
    case "processing":
      return "En préparation";
    case "shipped":
      return "Expédié";
    case "delivered":
      return "Livré";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export default function OrderTracking() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery<any>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  if (isLoading || !order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux commandes
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Commande #{order.id}</span>
              <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.isArray(order.items) &&
              order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span>
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} DT
                  </span>
                </div>
              ))}
            <div className="flex justify-between font-medium pt-4">
              <span>Total</span>
              <span>{order.total} DT</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

