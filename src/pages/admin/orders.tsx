import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminOrders } from "@/api/admin";
import { getOrderById } from "@/api/orders";
import { ADMIN_ORDER_TABS, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import {
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff,
  CheckCircle2,
  Circle,
  XCircle,
  Truck,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import { getMockCourier, getMockTrackingNumber, getExpectedDelivery } from "@/lib/mock-logistics";
import type { Order } from "@/types";
import type { OrderStatus } from "@/lib/constants";

const PAGE_SIZE = 8;
const FLOW_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  async function openOrderModal(orderId: string) {
    setModalLoading(true);
    setSelectedOrder(null);
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
    } finally {
      setModalLoading(false);
    }
  }

  const currentTab =
    ADMIN_ORDER_TABS.find((t) => t.key === activeTab) ?? ADMIN_ORDER_TABS[0];
  const filtered = currentTab.statuses
    ? orders.filter((o) =>
        (currentTab.statuses as readonly string[]).includes(o.status)
      )
    : orders;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isModalOpen = modalLoading || !!selectedOrder;

  // Modal order detail helpers
  const isDelivered = selectedOrder?.status === "delivered";
  const isCancelled = selectedOrder?.status === "cancelled";
  const isReturnRequested = selectedOrder?.status === "return_requested";
  const currentIndex = isDelivered
    ? FLOW_STATUSES.length - 1
    : FLOW_STATUSES.indexOf((selectedOrder?.status ?? "pending") as OrderStatus);
  const showLogistics = selectedOrder && ["shipped", "delivered"].includes(selectedOrder.status);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-border/40 pb-px">
          {ADMIN_ORDER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.statuses
              ? orders.filter((o) =>
                  (tab.statuses as readonly string[]).includes(o.status)
                ).length
              : orders.length;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders" description="No orders match this filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Order</div>
            <div className="w-24">Date</div>
            <div className="w-32">Shop</div>
            <div className="w-32">Buyer</div>
            <div className="w-20 text-right">Total</div>
            <div className="w-20 text-center">Status</div>
          </div>

          {paginated.map((order, i) => (
            <button
              key={order.id}
              type="button"
              onClick={() => openOrderModal(order.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/80 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:gap-4",
                i < paginated.length - 1 ? "border-b border-border/30" : ""
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {order.shop?.name ?? "—"}
                </p>
              </div>
              <div className="hidden w-24 text-sm text-muted-foreground sm:block">
                {formatDate(order.created_at)}
              </div>
              <div className="hidden w-32 truncate text-sm text-muted-foreground sm:block">
                {order.shop?.name ?? "—"}
              </div>
              <div className="hidden w-32 truncate text-sm text-muted-foreground sm:block">
                {order.buyer?.full_name ?? "—"}
              </div>
              <div className="hidden w-20 text-right text-sm font-medium sm:block">
                {formatPrice(order.total)}
              </div>
              <div className="flex w-20 items-center justify-center gap-1">
                <OrderStatusBadge status={order.status as OrderStatus} />
                <Eye className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border-border/60"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="px-4 text-sm tabular-nums text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border-border/60"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order detail modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setSelectedOrder(null); setModalLoading(false); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {modalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-lg">{selectedOrder.order_number}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <OrderStatusBadge status={selectedOrder.status as OrderStatus} />
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Return/refund banner */}
                {isReturnRequested && (
                  <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <RotateCcw className="h-5 w-5 shrink-0 text-orange-500" />
                    <p className="text-sm text-orange-800">The buyer has requested a return or refund.</p>
                  </div>
                )}

                {/* Status timeline */}
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
                    <div className="relative flex items-center justify-between px-2">
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
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
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
                      <div className="absolute left-0 right-0 top-4 -z-0 mx-6 flex">
                        {FLOW_STATUSES.slice(0, -1).map((_, i) => {
                          const resolvedIndex =
                            isReturnRequested || isDelivered
                              ? FLOW_STATUSES.length - 1
                              : currentIndex;
                          return (
                            <div key={i} className="flex-1 px-2">
                              <div
                                className={cn(
                                  "h-0.5 w-full",
                                  i < resolvedIndex ? "bg-indigo-400" : "bg-border"
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {showLogistics && (
                      <div className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{getMockCourier(selectedOrder.id)}</p>
                              <p className="text-xs text-muted-foreground">
                                Tracking: {getMockTrackingNumber(selectedOrder.id)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Expected delivery</p>
                            <p className="text-sm font-medium">{formatDate(getExpectedDelivery(selectedOrder.created_at))}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isDelivered && (
                      <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                        <PackageCheck className="h-5 w-5 shrink-0 text-green-500" />
                        <p className="text-sm font-semibold text-green-800">Order Completed</p>
                      </div>
                    )}
                  </>
                )}

                {/* Items */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {item.product_image ? (
                            <img src={item.product_image} alt="" className="h-full w-full object-cover" />
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
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(selectedOrder.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer & Shop */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 p-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h4>
                    <div className="space-y-1 text-sm">
                      <p>{selectedOrder.buyer?.full_name}</p>
                      <p className="text-muted-foreground">{selectedOrder.buyer?.email}</p>
                      <p className="text-muted-foreground">{selectedOrder.contact_phone ?? "No phone"}</p>
                      <p className="text-muted-foreground">{selectedOrder.shipping_address}</p>
                      {selectedOrder.notes && (
                        <p className="text-muted-foreground italic">Note: {selectedOrder.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</h4>
                    <div className="space-y-1 text-sm">
                      <p>{selectedOrder.shop?.name ?? "—"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{selectedOrder.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
