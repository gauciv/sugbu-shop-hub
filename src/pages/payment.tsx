import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth";
import { getOrderById, buyerUpdateOrderStatus } from "@/api/orders";
import { formatPrice } from "@/lib/utils";
import { Loader2, Wallet, Banknote, Building2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", icon: Wallet, description: "Pay via GCash e-wallet" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, description: "Pay when you receive" },
  { id: "bank", label: "Bank Transfer", icon: Building2, description: "Direct bank transfer" },
] as const;

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<string>("gcash");

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => toast.error("Order not found"))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Guard: must be pending and owned by current user
  useEffect(() => {
    if (loading || !order || !profile) return;
    if (order.buyer_id !== profile.id || order.status !== "pending") {
      toast.error("This order cannot be paid");
      navigate("/orders", { replace: true });
    }
  }, [order, profile, loading, navigate]);

  async function handlePay() {
    if (!order) return;
    setPaying(true);
    try {
      await buyerUpdateOrderStatus(order.id, "confirmed");
      toast.success("Payment confirmed!");
      navigate("/orders", { replace: true });
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <Skeleton className="mb-4 h-64 rounded-[28px]" />
        <Skeleton className="h-48 rounded-[24px]" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Payment</h1>

      <div className="space-y-6">
        {/* Order summary */}
        <Card className="border-border/60 rounded-[28px] shadow-cozy">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-lavender-100">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-3 w-3 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatPrice(item.line_total)}</p>
              </div>
            ))}

            <Separator />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="tabular-nums">{formatPrice(order.shipping_fee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card className="border-border/60 rounded-[28px] shadow-cozy">
          <CardHeader>
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = method === pm.id;
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-purple-400 bg-purple-50/60 shadow-sm"
                      : "border-border/60 hover:border-purple-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      isSelected ? "bg-purple-100" : "bg-muted"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isSelected ? "text-purple-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{pm.label}</p>
                    <p className="text-xs text-muted-foreground">{pm.description}</p>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-colors",
                        isSelected
                          ? "border-purple-500 bg-purple-500"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <div className="flex h-full items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Confirm */}
        <Button
          onClick={handlePay}
          disabled={paying}
          size="lg"
          className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
        >
          {paying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          Confirm Payment &middot; {formatPrice(order.total)}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          This is a demo. No real payment will be processed.
        </p>
      </div>
    </div>
  );
}
