import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopOrders } from "@/api/orders";
import { supabase } from "@/lib/supabase";
import { SELLER_ORDER_TABS } from "@/lib/constants";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ShoppingBag, Eye, Package } from "lucide-react";
import type { Order, Shop } from "@/types";
import type { OrderStatus } from "@/lib/constants";

export default function SellerOrdersPage() {
  const { profile } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const s = await getMyShop(profile.id);
        setShop(s);
        if (s) {
          const o = await getShopOrders(s.id);
          setOrders(o);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  // Realtime: sync order status changes
  useEffect(() => {
    if (!shop) return;
    const channel = supabase
      .channel("seller-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `shop_id=eq.${shop.id}` },
        (payload) => {
          const updated = payload.new as { id: string; status: string };
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status as Order["status"] } : o))
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shop]);

  const currentTab = SELLER_ORDER_TABS.find((t) => t.key === activeTab) ?? SELLER_ORDER_TABS[0];
  const filtered = currentTab.statuses
    ? orders.filter((o) => (currentTab.statuses as readonly string[]).includes(o.status))
    : orders;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
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
          {SELLER_ORDER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.statuses
              ? orders.filter((o) => (tab.statuses as readonly string[]).includes(o.status)).length
              : orders.length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === "all" ? ShoppingBag : Package}
          title={activeTab === "all" ? "No orders yet" : `No ${currentTab.label.toLowerCase()} orders`}
          description={
            activeTab === "all"
              ? "Orders will appear here when customers place them."
              : `You don't have any orders under "${currentTab.label}" right now.`
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-lavender-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Order ID</div>
            <div className="w-24">Date</div>
            <div>Customer</div>
            <div className="w-20 text-right">Total</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-16 text-right">Action</div>
          </div>
          {/* Order rows */}
          {filtered.map((order, i) => (
            <Link
              key={order.id}
              to={`/seller/orders/${order.id}`}
              className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-lavender-50/50 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_auto_auto] sm:gap-4 ${i < filtered.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {order.buyer?.full_name ?? "Customer"} &middot; {formatDate(order.created_at)}
                </p>
              </div>
              <div className="hidden w-24 text-sm text-muted-foreground sm:block">
                {formatDate(order.created_at)}
              </div>
              <div className="hidden truncate text-sm text-muted-foreground sm:block">
                {order.buyer?.full_name ?? "Customer"}
              </div>
              <div className="hidden w-20 text-right text-sm font-medium sm:block">
                {formatPrice(order.total)}
              </div>
              <div className="flex w-auto justify-center sm:w-24">
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>
              <div className="flex justify-end sm:w-16">
                <span className="text-sm font-bold sm:hidden">{formatPrice(order.total)}</span>
                <span className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
