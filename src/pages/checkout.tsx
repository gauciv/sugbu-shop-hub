import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth";
import { useCart, type CartProduct } from "@/hooks/use-cart";
import { placeOrder } from "@/api/orders";
import { getUserAddresses } from "@/api/addresses";
import { formatPrice, cn } from "@/lib/utils";
import { Loader2, ShieldCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/types";

interface CheckoutForm {
  shipping_address: string;
  contact_phone: string;
  notes: string;
}

export default function CheckoutPage() {
  const { profile } = useAuth();
  const { items, clearShopItems } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutForm>();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Fetch saved addresses and pre-fill from default
  useEffect(() => {
    if (!profile) return;
    getUserAddresses(profile.id).then((data) => {
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default) ?? data[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setValue("shipping_address", defaultAddr.address);
        setValue("contact_phone", defaultAddr.contact_phone ?? "");
      }
    });
  }, [profile, setValue]);

  function selectAddress(addr: Address) {
    setSelectedAddressId(addr.id);
    setValue("shipping_address", addr.address);
    setValue("contact_phone", addr.contact_phone ?? "");
  }

  const shopGroups = items.reduce<Record<string, { shopName: string; shopId: string; items: CartProduct[] }>>(
    (acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = { shopName: item.shopName, shopId: item.shopId, items: [] };
      }
      acc[item.shopId].items.push(item);
      return acc;
    },
    {}
  );

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function onSubmit(data: CheckoutForm) {
    if (!profile) return;
    setLoading(true);
    try {
      let lastOrderId = "";
      for (const group of Object.values(shopGroups)) {
        const order = await placeOrder({
          buyerId: profile.id,
          shopId: group.shopId,
          items: group.items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image || null,
            unitPrice: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: data.shipping_address,
          contactPhone: data.contact_phone || undefined,
          notes: data.notes || undefined,
        });
        clearShopItems(group.shopId);
        lastOrderId = order.id;
      }
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${lastOrderId}`);
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* Saved addresses picker */}
          {addresses.length > 0 && (
            <Card className="border-border/60 rounded-[28px] shadow-cozy">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Saved Addresses</CardTitle>
                  <Link to="/addresses">
                    <Button variant="ghost" size="sm" className="text-xs text-purple-600">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectAddress(addr)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                      selectedAddressId === addr.id
                        ? "border-purple-400 bg-purple-50/50 shadow-sm"
                        : "border-border/60 hover:border-purple-200"
                    )}
                  >
                    <MapPin className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      selectedAddressId === addr.id ? "text-purple-500" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{addr.label}</span>
                        {addr.is_default && (
                          <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{addr.full_name}</p>
                      <p className="text-xs text-muted-foreground">{addr.address}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {addresses.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 p-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No saved addresses.{" "}
                <Link to="/addresses" className="font-medium text-purple-600 hover:underline">
                  Add one
                </Link>{" "}
                to speed up checkout.
              </p>
            </div>
          )}

          <Card className="border-border/60 rounded-[28px] shadow-cozy">
            <CardHeader>
              <CardTitle className="text-base">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Shipping Address</Label>
                  <Textarea
                    {...register("shipping_address", { required: "Address is required", minLength: { value: 10, message: "Please enter a complete address" } })}
                    placeholder="Enter your complete shipping address"
                    rows={3}
                    className="border-border/60"
                  />
                  {errors.shipping_address && <p className="text-xs text-destructive">{errors.shipping_address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    {...register("contact_phone")}
                    placeholder="+63 9XX XXX XXXX"
                    className="border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Notes (optional)</Label>
                  <Textarea
                    {...register("notes")}
                    placeholder="Any special instructions"
                    rows={2}
                    className="border-border/60"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-20 border-border/60 rounded-[24px] shadow-cozy">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.values(shopGroups).map((group) => (
                <div key={group.shopId}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {group.shopName}
                  </p>
                  {group.items.map((item) => (
                    <div key={item.productId} className="flex justify-between py-1 text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg tabular-nums">{formatPrice(total)}</span>
              </div>
              <Button
                type="submit"
                form="checkout-form"
                disabled={loading}
                size="lg"
                className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
