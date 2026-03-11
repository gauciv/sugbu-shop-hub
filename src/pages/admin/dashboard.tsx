import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getAdminStats, getRecentOrders, type AdminStats } from "@/api/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { Order } from "@/types";
import type { OrderStatus } from "@/lib/constants";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getRecentOrders(5)])
      .then(([s, o]) => {
        setStats(s);
        setRecentOrders(o);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500 bg-blue-50",
    },
    {
      label: "Total Shops",
      value: stats?.totalShops ?? 0,
      icon: Store,
      color: "text-indigo-500 bg-indigo-50",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-purple-500 bg-purple-50",
    },
    {
      label: "Platform Revenue",
      value: formatPrice(stats?.platformRevenue ?? 0),
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and quick actions
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending approvals callout */}
      {(stats?.pendingApprovals ?? 0) > 0 && (
        <Link to="/admin/shops?tab=pending">
          <Card className="border-amber-200 bg-amber-50 transition-colors hover:bg-amber-100">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {stats?.pendingApprovals} shop
                    {stats?.pendingApprovals !== 1 ? "s" : ""} pending approval
                  </p>
                  <p className="text-xs text-amber-600">
                    Review and approve new seller shops
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Recent orders */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-4 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Order</div>
            <div className="w-24">Date</div>
            <div>Shop / Buyer</div>
            <div className="w-24 text-right">Total</div>
            <div className="w-24 text-center">Status</div>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            recentOrders.map((order, i) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/80 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_auto] sm:gap-4 ${
                  i < recentOrders.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {order.order_number}
                  </p>
                </div>
                <div className="hidden w-24 text-sm text-muted-foreground sm:block">
                  {formatDate(order.created_at)}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="truncate text-sm text-muted-foreground">
                    {order.shop?.name ?? "—"} &middot;{" "}
                    {order.buyer?.full_name ?? "—"}
                  </p>
                </div>
                <div className="hidden w-24 text-right text-sm font-medium sm:block">
                  {formatPrice(order.total)}
                </div>
                <div className="flex w-24 justify-center">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
