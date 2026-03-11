import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getOrderById } from "@/api/orders";
import { adminUpdateOrderStatus } from "@/api/admin";
import { getMockCourier, getMockTrackingNumber, getExpectedDelivery } from "@/lib/mock-logistics";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
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
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/types";

const FLOW_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped"];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus>("pending");
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then((o) => {
        setOrder(o);
        setOverrideStatus(o.status as OrderStatus);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleOverride() {
    if (!order) return;
    if (!confirm(`Force update order to "${ORDER_STATUS_CONFIG[overrideStatus].label}"?`)) return;
    setOverriding(true);
    try {
      const updated = await adminUpdateOrderStatus(order.id, overrideStatus);
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success(`Order status forced to ${ORDER_STATUS_CONFIG[overrideStatus].label}`);
    } catch {
      toast.error("Failed to override order status");
    } finally {
      setOverriding(false);
    }
  }

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isReturnRequested = order.status === "return_requested";
  const currentIndex = isDelivered
    ? FLOW_STATUSES.length - 1
    : FLOW_STATUSES.indexOf(order.status as OrderStatus);
  const showLogistics = ["shipped", "delivered"].includes(order.status);
  const courier = getMockCourier(order.id);
  const trackingNumber = getMockTrackingNumber(order.id);
  const expectedDelivery = getExpectedDelivery(order.created_at);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/orders")}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      {/* Return/refund banner */}
      {isReturnRequested && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <RotateCcw className="h-6 w-6 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                Return/Refund Requested
              </p>
              <p className="text-xs text-orange-600">
                The buyer has requested a return or refund. Use the Admin Override
                panel below to resolve this order.
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
                  const resolvedIndex =
                    isReturnRequested || isDelivered
                      ? FLOW_STATUSES.length - 1
                      : currentIndex;
                  const isCompleted = i <= resolvedIndex;
                  const isCurrent = i === resolvedIndex;
                  return (
                    <div key={status} className="relative z-10 flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isCompleted
                            ? "border-indigo-400 bg-indigo-400 text-white"
                            : "border-border bg-white text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-[10px] font-medium sm:text-xs",
                          isCurrent
                            ? "font-semibold text-indigo-500"
                            : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {ORDER_STATUS_CONFIG[status].label}
                      </span>
                    </div>
                  );
                })}
                {/* Connecting lines */}
                <div className="absolute left-0 right-0 top-4 -z-0 mx-4 flex">
                  {FLOW_STATUSES.slice(0, -1).map((_, i) => {
                    const resolvedIndex =
                      isReturnRequested || isDelivered
                        ? FLOW_STATUSES.length - 1
                        : currentIndex;
                    return (
                      <div key={i} className="flex-1 px-2">
                        <div
                          className={cn(
                            "h-0.5 w-full transition-all duration-500",
                            i < resolvedIndex ? "bg-indigo-400" : "bg-border"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {showLogistics && (
                <div className="mt-4 rounded-2xl bg-muted/50 p-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{courier}</p>
                        <p className="text-xs text-muted-foreground">
                          Tracking: {trackingNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Expected delivery</p>
                      <p className="text-sm font-medium">{formatDate(expectedDelivery)}</p>
                    </div>
                  </div>
                </div>
              )}

              {isDelivered && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 p-4">
                  <PackageCheck className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Order Completed
                    </p>
                    <p className="text-xs text-green-600">
                      The buyer has confirmed receipt of this order.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Admin Override Panel */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-indigo-800">
            <ShieldAlert className="h-4 w-4" />
            Admin Override
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-indigo-600">
            Force this order to any status regardless of the normal progression flow.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as OrderStatus)}
              className="h-9 rounded-md border border-indigo-200 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <Button
              disabled={overriding || overrideStatus === order.status}
              onClick={handleOverride}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {overriding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Force Update Status
            </Button>
          </div>
          {overrideStatus === order.status && (
            <p className="text-xs text-indigo-500">
              This is already the current status.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order items */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} x {formatPrice(item.unit_price)}
                </p>
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

      {/* Party details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {order.buyer?.full_name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {order.buyer?.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {order.contact_phone ?? "N/A"}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span>{" "}
              {order.shipping_address}
            </p>
            {order.notes && (
              <p>
                <span className="text-muted-foreground">Notes:</span>{" "}
                {order.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Shop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Shop:</span>{" "}
              {order.shop?.name ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Order ID:</span>{" "}
              <span className="font-mono text-xs">{order.id}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
