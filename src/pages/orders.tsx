import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { useAuth } from "@/context/auth";
import { getBuyerOrders } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag, ImageOff } from "lucide-react";
import type { Order } from "@/types";
import type { OrderStatus } from "@/lib/constants";

export default function OrdersPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getBuyerOrders(profile.id).then(setOrders).finally(() => setLoading(false));
  }, [profile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="mb-3 h-28 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={{ label: "Browse Shops", onClick: () => navigate("/shops") }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/60 transition-colors hover:border-purple-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{order.order_number}</p>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.shop?.name ?? "Shop"} &middot; {formatDate(order.created_at)}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="h-12 w-12 overflow-hidden rounded-lg bg-lavender-100">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageOff className="h-3.5 w-3.5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-xs font-medium text-purple-400">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
