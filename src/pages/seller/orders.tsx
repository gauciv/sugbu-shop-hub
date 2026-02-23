import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopOrders } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
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
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
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
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link key={order.id} to={`/seller/orders/${order.id}`}>
              <Card className="flex items-center justify-between border-border/60 p-4 transition-colors hover:border-purple-200 hover:bg-lavender-100/30">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.buyer?.full_name ?? "Customer"} &middot; {formatDate(order.created_at)}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(order.total)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
