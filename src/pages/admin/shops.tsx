import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminShops, approveShop, suspendShop, reinstateShop } from "@/api/admin";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Store, ChevronLeft, ChevronRight, CheckCircle2, Ban, RotateCcw } from "lucide-react";
import type { Shop } from "@/types";

const PAGE_SIZE = 8;

const TABS = [
  { key: "all",       label: "All",       filter: (s: Shop) => true },
  { key: "pending",   label: "Pending",   filter: (s: Shop) => s.approval_status === "pending" },
  { key: "approved",  label: "Approved",  filter: (s: Shop) => s.approval_status === "approved" },
  { key: "suspended", label: "Suspended", filter: (s: Shop) => s.approval_status === "suspended" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800",
  approved:  "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

type TabKey = typeof TABS[number]["key"];

interface AdminShop extends Shop {
  owner?: { id: string; full_name: string; email: string };
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);
  const [confirmShop, setConfirmShop] = useState<AdminShop | null>(null);

  useEffect(() => {
    getAdminShops()
      .then((data) => setShops(data as AdminShop[]))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(
    shopId: string,
    action: "approve" | "suspend" | "reinstate"
  ) {
    setActing(shopId);
    setConfirmShop(null);
    try {
      let updated: Shop;
      if (action === "approve") updated = await approveShop(shopId);
      else if (action === "suspend") updated = await suspendShop(shopId);
      else updated = await reinstateShop(shopId);

      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, ...updated } : s))
      );
      toast.success(
        action === "approve"
          ? "Shop approved"
          : action === "suspend"
          ? "Shop suspended"
          : "Shop reinstated"
      );
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const filtered = shops.filter(currentTab.filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Shops</h1>
        <p className="text-sm text-muted-foreground">{shops.length} total shops</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-border/40 pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = shops.filter(tab.filter).length;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={cn(
                  "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-indigo-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                      isActive ? "bg-indigo-100 text-indigo-700" : "bg-muted text-muted-foreground"
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
        <EmptyState
          icon={Store}
          title={`No ${activeTab !== "all" ? activeTab : ""} shops`}
          description={
            activeTab === "pending"
              ? "No shops are awaiting approval."
              : "No shops match this filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="w-8" />
            <div>Shop</div>
            <div className="w-36">Owner</div>
            <div className="w-16 text-center">Products</div>
            <div className="w-20 text-center">Status</div>
            <div className="w-32 text-right">Actions</div>
          </div>

          {paginated.map((shop, i) => (
            <div
              key={shop.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:gap-4 ${
                i < paginated.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              {/* Avatar */}
              <Avatar className="hidden h-8 w-8 sm:flex">
                <AvatarImage src={shop.logo_url ?? undefined} />
                <AvatarFallback className="bg-indigo-50 text-[10px] font-bold text-indigo-400">
                  {getInitials(shop.name)}
                </AvatarFallback>
              </Avatar>

              {/* Shop info */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{shop.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(shop.created_at)}
                </p>
              </div>

              {/* Owner */}
              <div className="hidden w-36 min-w-0 sm:block">
                <p className="truncate text-sm">{shop.owner?.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">{shop.owner?.email ?? ""}</p>
              </div>

              {/* Products */}
              <div className="hidden w-16 text-center text-sm text-muted-foreground sm:block">
                {shop.product_count ?? 0}
              </div>

              {/* Status badge */}
              <div className="flex w-20 justify-center">
                <Badge
                  variant="secondary"
                  className={`border-0 text-[11px] capitalize ${
                    STATUS_BADGE[shop.approval_status] ?? ""
                  }`}
                >
                  {shop.approval_status}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex w-32 items-center justify-end gap-1">
                {shop.approval_status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acting === shop.id}
                      onClick={() => handleAction(shop.id, "approve")}
                      className="h-7 border-green-200 px-2 text-xs text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acting === shop.id}
                      onClick={() => setConfirmShop(shop)}
                      className="h-7 border-red-200 px-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Ban className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {shop.approval_status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting === shop.id}
                    onClick={() => setConfirmShop(shop)}
                    className="h-7 border-red-200 px-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Ban className="mr-1 h-3 w-3" /> Suspend
                  </Button>
                )}
                {shop.approval_status === "suspended" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting === shop.id}
                    onClick={() => handleAction(shop.id, "reinstate")}
                    className="h-7 border-green-200 px-2 text-xs text-green-700 hover:bg-green-50"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" /> Reinstate
                  </Button>
                )}
              </div>
            </div>
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

      {/* Suspend confirmation dialog */}
      <Dialog open={!!confirmShop} onOpenChange={(open) => !open && setConfirmShop(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend shop?</DialogTitle>
            <DialogDescription>
              This will suspend &ldquo;{confirmShop?.name}&rdquo; and hide it from the storefront. The shop owner will lose access to their seller dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmShop(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={acting === confirmShop?.id}
              onClick={() => confirmShop && handleAction(confirmShop.id, "suspend")}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
