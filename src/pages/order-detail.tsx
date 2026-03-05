import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getOrderById, buyerUpdateOrderStatus } from "@/api/orders";
import { supabase } from "@/lib/supabase";
import { getMockCourier, getMockTrackingNumber, getExpectedDelivery } from "@/lib/mock-logistics";
import { type OrderStatus, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  ImageOff,
  Loader2,
  MapPin,
  Phone,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: "pending", label: "Order Placed", icon: CreditCard },
  { status: "confirmed", label: "Payment Confirmed", icon: CheckCircle2 },
  { status: "preparing", label: "Preparing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: PackageCheck },
];

function getTimelineIndex(status: OrderStatus): number {
  if (status === "cancelled" || status === "return_requested") return -1;
  return TIMELINE_STEPS.findIndex((s) => s.status === status);
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then(setOrder)
      .catch(() => {
        toast.error("Order not found");
        navigate("/orders", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Realtime: sync order status changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`buyer-order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as { status: string };
          setOrder((prev) => prev ? { ...prev, status: updated.status as Order["status"] } : prev);
          toast.info(`Order status updated to ${ORDER_STATUS_CONFIG[updated.status as OrderStatus]?.label ?? updated.status}`);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function handleAction(status: "delivered" | "return_requested" | "cancelled") {
    if (!order) return;
    setActing(true);
    try {
      const updated = await buyerUpdateOrderStatus(order.id, status);
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      const labels = { delivered: "Order marked as received", return_requested: "Return/refund requested", cancelled: "Order cancelled" };
      toast.success(labels[status]);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-4 h-48 rounded-[28px]" />
        <Skeleton className="mb-4 h-64 rounded-[28px]" />
        <Skeleton className="h-40 rounded-[28px]" />
      </div>
    );
  }

  if (!order) return null;

  const currentIndex = getTimelineIndex(order.status as OrderStatus);
  const isTerminal = order.status === "cancelled" || order.status === "return_requested";
  const courier = getMockCourier(order.id);
  const trackingNumber = getMockTrackingNumber(order.id);
  const expectedDelivery = getExpectedDelivery(order.created_at);
  const showLogistics = ["shipped", "delivered"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button + header */}
      <button
        onClick={() => navigate("/orders")}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">{order.order_number}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="space-y-5">
        {/* Delivery timeline */}
        <Card className="border-border/60 rounded-[28px] shadow-cozy">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isTerminal
                ? order.status === "cancelled"
                  ? "Order Cancelled"
                  : "Return/Refund Requested"
                : "Delivery Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTerminal ? (
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                {order.status === "cancelled" ? (
                  <XCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <RotateCcw className="h-6 w-6 text-orange-500" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {order.status === "cancelled"
                      ? "This order has been cancelled."
                      : "A return/refund has been requested for this order."}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.status === "cancelled"
                      ? "If you were charged, a refund will be processed."
                      : "The seller will review your request."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex flex-1 flex-col items-center text-center">
                      {/* Connector + icon */}
                      <div className="relative flex w-full items-center justify-center">
                        {/* Left connector */}
                        {i > 0 && (
                          <div
                            className={cn(
                              "absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                              i <= currentIndex ? "bg-purple-400" : "bg-border"
                            )}
                          />
                        )}
                        {/* Right connector */}
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                              i < currentIndex ? "bg-purple-400" : "bg-border"
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            "relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                            isCompleted
                              ? "bg-purple-500 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-[11px] leading-tight",
                          isCurrent ? "font-semibold text-purple-600" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Logistics info */}
            {showLogistics && (
              <div className="mt-4 rounded-2xl bg-muted/50 p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{courier}</p>
                    <p className="text-xs text-muted-foreground">Tracking: {trackingNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Expected delivery</p>
                    <p className="text-sm font-medium">{formatDate(expectedDelivery)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border-border/60 rounded-[28px] shadow-cozy">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Items</CardTitle>
              {order.shop && (
                <Link
                  to={`/shop/${order.shop.slug}`}
                  className="text-xs font-medium text-purple-600 hover:underline"
                >
                  {order.shop.name}
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-lavender-100">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.unit_price)} x {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatPrice(item.line_total)}
                </p>
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

        {/* Shipping info */}
        <Card className="border-border/60 rounded-[28px] shadow-cozy">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">{order.shipping_address}</p>
            </div>
            {order.contact_phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">{order.contact_phone}</p>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-2.5">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-2.5">
          {order.status === "pending" && (
            <Button
              size="lg"
              className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
              onClick={() => navigate(`/payment/${order.id}`)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now &middot; {formatPrice(order.total)}
            </Button>
          )}

          {order.status === "shipped" && (
            <Button
              size="lg"
              className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
              disabled={acting}
              onClick={() => handleAction("delivered")}
            >
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageCheck className="mr-2 h-4 w-4" />}
              Order Received
            </Button>
          )}

          {order.status === "delivered" && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={acting}
              onClick={() => handleAction("return_requested")}
            >
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Request Return/Refund
            </Button>
          )}

          {order.status === "pending" && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground hover:text-destructive"
              disabled={acting}
              onClick={() => handleAction("cancelled")}
            >
              {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
