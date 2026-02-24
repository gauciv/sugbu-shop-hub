import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopOrders } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag, Eye } from "lucide-react";
import type { Order, Shop } from "@/types";
import type { OrderStatus } from "@/lib/constants";

export default function SellerOrdersPage() {
  const { profile } = useAuth();
  const [, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
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

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-lavender-100/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders" description="Orders will appear here when customers place them." />
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
            <div
              key={order.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-lavender-50/50 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_auto_auto] ${i < filtered.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{order.order_number}</p>
                {/* Mobile-only secondary info */}
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
              <div className="flex w-24 justify-center">
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>
              <div className="flex w-16 justify-end">
                {/* Mobile: show total */}
                <span className="text-sm font-bold sm:hidden">{formatPrice(order.total)}</span>
                <Link to={`/seller/orders/${order.id}`} className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
