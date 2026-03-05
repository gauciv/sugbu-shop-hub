import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { getBuyerOrders } from "@/api/orders";
import { BUYER_ORDER_TABS } from "@/lib/constants";
import { getExpectedDelivery } from "@/lib/mock-logistics";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ShoppingBag, ImageOff, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";
import type { OrderStatus } from "@/lib/constants";

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!profile) return;
    getBuyerOrders(profile.id).then(setOrders).finally(() => setLoading(false));
  }, [profile]);

  // Realtime: sync order status changes
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel("buyer-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${profile.id}` },
        (payload) => {
          const updated = payload.new as { id: string; status: string };
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status as Order["status"] } : o))
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const currentTab = BUYER_ORDER_TABS.find((t) => t.key === activeTab) ?? BUYER_ORDER_TABS[0];
  const filteredOrders = currentTab.statuses
    ? orders.filter((o) => (currentTab.statuses as readonly string[]).includes(o.status))
    : orders;
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="mb-6 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="mb-3 h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">My Orders</h1>

      {/* Horizontal tabs */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 overflow-x-auto bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex gap-1 border-b border-border/40 pb-px">
          {BUYER_ORDER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.statuses
              ? orders.filter((o) => (tab.statuses as readonly string[]).includes(o.status)).length
              : orders.length;

            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={cn(
                  "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-purple-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-purple-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order list */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={activeTab === "all" ? ShoppingBag : Package}
          title={activeTab === "all" ? "No orders yet" : `No ${currentTab.label.toLowerCase()} orders`}
          description={
            activeTab === "all"
              ? "When you place an order, it will appear here."
              : `You don't have any orders under "${currentTab.label}" right now.`
          }
          action={activeTab === "all" ? { label: "Browse Shops", onClick: () => navigate("/shops") } : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {paginatedOrders.map((order) => {
            const firstItem = order.items?.[0];
            const itemCount = order.items?.length ?? 0;
            const expectedDelivery = getExpectedDelivery(order.created_at);
            const showDelivery = ["confirmed", "preparing", "shipped"].includes(order.status);

            return (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-3.5 text-left transition-all hover:border-purple-200 hover:shadow-cozy active:scale-[0.995]"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-lavender-100">
                  {firstItem?.product_image ? (
                    <img
                      src={firstItem.product_image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Middle: order info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {order.shop?.name ?? "Shop"} &middot; {formatDate(order.created_at)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>

                {/* Right: price & status */}
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  {showDelivery && (
                    <p className="text-[10px] text-muted-foreground">
                      Est. {formatDate(expectedDelivery)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
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
    </div>
  );
}
