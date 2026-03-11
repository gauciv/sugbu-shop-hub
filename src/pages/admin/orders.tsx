import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getAdminOrders } from "@/api/admin";
import { ADMIN_ORDER_TABS } from "@/lib/constants";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { Order } from "@/types";
import type { OrderStatus } from "@/lib/constants";

const PAGE_SIZE = 8;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const currentTab =
    ADMIN_ORDER_TABS.find((t) => t.key === activeTab) ?? ADMIN_ORDER_TABS[0];
  const filtered = currentTab.statuses
    ? orders.filter((o) =>
        (currentTab.statuses as readonly string[]).includes(o.status)
      )
    : orders;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/80 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:gap-4",
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
            </Link>
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
    </div>
  );
}
