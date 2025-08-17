import { useState } from "react";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import { API_BASE } from "@/lib/api";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  governorate: string;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    governorate: "",
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    governorate: "",
  });

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: newsletterStatus } = useQuery<{ subscribed: boolean; discountAvailable: boolean }>({
    queryKey: ["/api/newsletter/status"],
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Commande créée",
        description: `Votre commande #${order.orderNumber} a été créée avec succès.`,
      });
      navigate(`/orders/${order.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour passer une commande.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${API_BASE}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const tunisianGovernorates = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Kairouan",
    "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Gafsa", "Tozeur", "Kebili", "Gabès", "Medenine", "Tataouine"
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande</h1>
          <p className="text-gray-600 mb-8">Vous devez être connecté pour passer une commande.</p>
          <Button onClick={() => (window.location.href = `${API_BASE}/api/login`)} data-testid="checkout-login">
            Se connecter
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if ((cartItems as any[]).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">Ajoutez des produits à votre panier avant de passer commande.</p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continuer mes achats
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = (cartItems as any[]).reduce((sum: number, item: any) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 150 ? 0 : 7;
  const tax = subtotal * 0.19;
  const discount = newsletterStatus?.discountAvailable ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  const handleAddressChange = (field: keyof ShippingAddress, value: string, isShipping = true) => {
    if (isShipping) {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
      if (sameAsBilling) {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'governorate'];
      return required.every(field => shippingAddress[field as keyof ShippingAddress]);
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez vérifier vos informations.",
        variant: "destructive",
      });
      return;
    }

    const orderNumber = `ELG-${Date.now()}`;
    const orderData = {
      orderNumber,
      status: "pending",
      total: total.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      discount: discount.toFixed(2),
      shippingAddress,
      billingAddress: sameAsBilling ? shippingAddress : billingAddress,
      paymentMethod,
      notes: "",
    };

    if (paymentMethod === "cod") {
      createOrderMutation.mutate(orderData);
      return;
    }

    try {
      const orderRes = await apiRequest("POST", "/api/orders", orderData);
      const order = await orderRes.json();

      const endpoint =
        paymentMethod === "flouci" ? "/api/payments/flouci" : "/api/payments/konnect";
      const payRes = await apiRequest(
        "POST",
        endpoint,
        {
          amount: Math.round(total * 100),
          orderId: order.orderNumber,

          returnUrl: `${window.location.origin}/orders/${order.id}`,
        },
      );
      const payment = await payRes.json();
      window.location.href = payment.url;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de procéder au paiement.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    { id: 1, title: "Informations de livraison", icon: Truck },
    { id: 2, title: "Paiement", icon: CreditCard },
    { id: 3, title: "Confirmation", icon: Shield },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" data-testid="breadcrumb">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary">Panier</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Commande</span>
        </nav>

        {/* Back to Cart */}
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="outline" className="flex items-center space-x-2" data-testid="back-to-cart">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au panier</span>
            </Button>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? "bg-primary border-primary text-white" 
                    : "border-gray-300 text-gray-300"
                }`} data-testid={`step-${step.id}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-primary" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold" data-testid="current-step-title">
              {steps[currentStep - 1].title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange("firstName", e.target.value)}
                        data-testid="shipping-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange("lastName", e.target.value)}
                        data-testid="shipping-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange("email", e.target.value)}
                      data-testid="shipping-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      data-testid="shipping-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                      data-testid="shipping-address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                        data-testid="shipping-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                        data-testid="shipping-postal-code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="governorate">Gouvernorat *</Label>
                      <Select 
                        value={shippingAddress.governorate} 
                        onValueChange={(value) => handleAddressChange("governorate", value)}
                      >
                        <SelectTrigger data-testid="shipping-governorate">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {tunisianGovernorates.map((gov) => (
                            <SelectItem key={gov} value={gov}>
                              {gov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" data-testid="payment-cod" />
                      <Label htmlFor="cod">Paiement à la livraison</Label>
                    </div>
                    <div className="flex items-center space-x-2">

                      <RadioGroupItem value="konnect" id="konnect" data-testid="payment-konnect" />
                      <Label htmlFor="konnect">Paiement en ligne (Konnect)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flouci" id="flouci" data-testid="payment-flouci" />
                      <Label htmlFor="flouci">Paiement en ligne (Flouci)</Label>

                    </div>
                  </RadioGroup>

                  {paymentMethod !== "cod" && (
                    <p className="mt-4 text-sm text-gray-600">
                      Vous serez redirigé vers une page de paiement sécurisée.
                    </p>
                  )}

                  <div className="mt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsBilling"
                        checked={sameAsBilling}
                        onCheckedChange={(checked) => setSameAsBilling(checked === true)}
                        data-testid="same-as-billing"
                      />
                      <Label htmlFor="sameAsBilling">
                        L'adresse de facturation est la même que celle de livraison
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmation de commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                      <div className="text-sm text-gray-600" data-testid="shipping-summary">
                        <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.governorate} {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Méthode de paiement</h3>
                      <p className="text-sm text-gray-600" data-testid="payment-summary">

                        {
                          {
                            cod: "Paiement à la livraison",
                            konnect: "Paiement en ligne (Konnect)",
                            flouci: "Paiement en ligne (Flouci)",
                          }[paymentMethod]
                        }

                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Articles commandés</h3>
                      <div className="space-y-2">
                        {(cartItems as any[]).map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>{(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)} DT</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                data-testid="previous-step"
              >
                Précédent
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="next-step"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="place-order"
                >
                  {createOrderMutation.isPending ? "Traitement..." : "Confirmer la commande"}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Résumé de commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(cartItems as any[]).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm" data-testid={`summary-item-${item.id}`}>
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)} DT</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span data-testid="summary-subtotal">{subtotal.toFixed(2)} DT</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span data-testid="summary-shipping">
                    {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} DT`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>TVA (19%)</span>
                  <span data-testid="summary-tax">{tax.toFixed(2)} DT</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction newsletter</span>
                    <span data-testid="summary-discount">-{discount.toFixed(2)} DT</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary" data-testid="summary-total">
                    {total.toFixed(2)} DT
                  </span>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
