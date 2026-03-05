import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getOrderById, updateOrderStatus } from "@/api/orders";
import { supabase } from "@/lib/supabase";
import { getMockCourier, getMockTrackingNumber, getExpectedDelivery } from "@/lib/mock-logistics";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/constants";
import {
  ArrowLeft,
  Loader2,
  ImageOff,
  CheckCircle2,
  Circle,
  XCircle,
  RotateCcw,
  Truck,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/types";

const FLOW_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped"];

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  // Realtime: sync order status changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`seller-order-${id}`)
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

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder((prev) => prev ? { ...prev, status: updated.status } : prev);
      if (status === "shipped") {
        const courier = getMockCourier(order.id);
        const tracking = getMockTrackingNumber(order.id);
        toast.success(`Shipped via ${courier} (${tracking})`);
      } else {
        toast.success(`Order marked as ${ORDER_STATUS_CONFIG[status].label}`);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>;
  }

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isReturnRequested = order.status === "return_requested";
  const isTerminal = isCancelled || isReturnRequested || isDelivered;
  const currentIndex = isDelivered
    ? FLOW_STATUSES.length - 1
    : FLOW_STATUSES.indexOf(order.status as OrderStatus);
  const nextStatus = !isTerminal && currentIndex >= 0 && currentIndex < FLOW_STATUSES.length - 1
    ? FLOW_STATUSES[currentIndex + 1]
    : null;
  const showLogistics = ["shipped", "delivered"].includes(order.status);
  const courier = getMockCourier(order.id);
  const trackingNumber = getMockTrackingNumber(order.id);
  const expectedDelivery = getExpectedDelivery(order.created_at);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/seller/orders")} className="text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      {/* Return/Refund banner */}
      {isReturnRequested && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <RotateCcw className="h-6 w-6 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Return/Refund Requested</p>
              <p className="text-xs text-orange-600">
                The buyer has requested a return or refund for this order. Please review and take appropriate action.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status timeline */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">Order Cancelled</p>
                <p className="text-xs text-red-600">This order has been cancelled.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-between">
                {FLOW_STATUSES.map((status, i) => {
                  const resolvedIndex = isReturnRequested || isDelivered ? FLOW_STATUSES.length - 1 : currentIndex;
                  const isCompleted = i <= resolvedIndex;
                  const isCurrent = i === resolvedIndex;
                  return (
                    <div key={status} className="relative z-10 flex flex-col items-center">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isCompleted
                          ? "border-purple-400 bg-purple-400 text-white"
                          : "border-border bg-white text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <span className={cn(
                        "mt-2 text-[10px] font-medium sm:text-xs",
                        isCurrent ? "text-purple-500 font-semibold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {ORDER_STATUS_CONFIG[status].label}
                      </span>
                    </div>
                  );
                })}
                {/* Connecting lines */}
                <div className="absolute left-0 right-0 top-4 -z-0 mx-4 flex">
                  {FLOW_STATUSES.slice(0, -1).map((_, i) => {
                    const resolvedIndex = isReturnRequested || isDelivered ? FLOW_STATUSES.length - 1 : currentIndex;
                    return (
                      <div key={i} className="flex-1 px-2">
                        <div className={cn(
                          "h-0.5 w-full transition-all duration-500",
                          i < resolvedIndex ? "bg-purple-400" : "bg-border"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logistics info */}
              {showLogistics && (
                <div className="mt-4 rounded-2xl bg-muted/50 p-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{courier}</p>
                        <p className="text-xs text-muted-foreground">Tracking: {trackingNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Expected delivery</p>
                      <p className="text-sm font-medium">{formatDate(expectedDelivery)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status info cards */}
              {order.status === "shipped" && !nextStatus && !isReturnRequested && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-purple-50 p-4">
                  <PackageCheck className="h-6 w-6 shrink-0 text-purple-500" />
                  <div>
                    <p className="text-sm font-semibold text-purple-800">Waiting for Buyer Confirmation</p>
                    <p className="text-xs text-purple-600">
                      The order has been shipped. The buyer will confirm once they receive the package.
                    </p>
                  </div>
                </div>
              )}

              {isDelivered && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 p-4">
                  <PackageCheck className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Order Completed</p>
                    <p className="text-xs text-green-600">
                      The buyer has confirmed receipt of this order.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!isReturnRequested && !isDelivered && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {nextStatus && (
                    <Button
                      onClick={() => handleStatusChange(nextStatus)}
                      disabled={updating}
                      className="shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {nextStatus === "shipped" ? (
                        <>
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </>
                      ) : (
                        `Mark as ${ORDER_STATUS_CONFIG[nextStatus].label}`
                      )}
                    </Button>
                  )}
                  {order.status !== "shipped" && order.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={updating}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-lavender-100">
                {item.product_image ? (
                  <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.unit_price)}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.line_total)}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {order.buyer?.full_name}</p>
          <p><span className="text-muted-foreground">Email:</span> {order.buyer?.email}</p>
          <p><span className="text-muted-foreground">Phone:</span> {order.contact_phone ?? "N/A"}</p>
          <p><span className="text-muted-foreground">Address:</span> {order.shipping_address}</p>
          {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
