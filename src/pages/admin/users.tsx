import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminUsers, suspendUser, reinstateUser } from "@/api/admin";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Users, ChevronLeft, ChevronRight, Ban, RotateCcw } from "lucide-react";
import type { Profile } from "@/types";

const PAGE_SIZE = 8;

const TABS = [
  { key: "all",     label: "All",     filter: () => true as boolean },
  { key: "buyers",  label: "Buyers",  filter: (u: Profile) => u.role === "buyer" },
  { key: "sellers", label: "Sellers", filter: (u: Profile) => u.role === "seller" },
] as const;

const ROLE_BADGE: Record<string, string> = {
  buyer:  "bg-blue-100 text-blue-700",
  seller: "bg-purple-100 text-purple-700",
};

type TabKey = typeof TABS[number]["key"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<Profile | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleSuspend(user: Profile) {
    if (user.role === "admin") return;
    setActing(user.id);
    setConfirmUser(null);
    try {
      const updated = user.is_suspended
        ? await reinstateUser(user.id)
        : await suspendUser(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
      );
      toast.success(user.is_suspended ? "User reinstated" : "User suspended");
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const filtered = users.filter(currentTab.filter);
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
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} total users</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-border/40 pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = users.filter(tab.filter).length;
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
          icon={Users}
          title="No users found"
          description="No users match this filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="w-8" />
            <div>User</div>
            <div className="w-20 text-center">Role</div>
            <div className="w-28 text-center">Joined</div>
            <div className="w-20 text-center">Status</div>
            <div className="w-24 text-right">Action</div>
          </div>

          {paginated.map((user, i) => (
            <div
              key={user.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:gap-4 ${
                i < paginated.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              {/* Avatar */}
              <Avatar className="hidden h-8 w-8 sm:flex">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-500">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Name + email */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>

              {/* Role */}
              <div className="hidden w-20 justify-center sm:flex">
                <Badge
                  variant="secondary"
                  className={`border-0 text-[11px] capitalize ${ROLE_BADGE[user.role] ?? ""}`}
                >
                  {user.role}
                </Badge>
              </div>

              {/* Joined */}
              <div className="hidden w-28 text-center text-xs text-muted-foreground sm:block">
                {formatDate(user.created_at)}
              </div>

              {/* Status */}
              <div className="hidden w-20 justify-center sm:flex">
                <Badge
                  variant="secondary"
                  className={`border-0 text-[11px] ${
                    user.is_suspended
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.is_suspended ? "Suspended" : "Active"}
                </Badge>
              </div>

              {/* Action */}
              <div className="flex w-24 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting === user.id}
                  onClick={() => setConfirmUser(user)}
                  className={cn(
                      "h-7 px-2 text-xs",
                      user.is_suspended
                        ? "border-green-200 text-green-700 hover:bg-green-50"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    )}
                  >
                    {user.is_suspended ? (
                      <>
                        <RotateCcw className="mr-1 h-3 w-3" /> Reinstate
                      </>
                    ) : (
                      <>
                        <Ban className="mr-1 h-3 w-3" /> Suspend
                      </>
                    )}
                  </Button>
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

      {/* Suspend / Reinstate confirmation dialog */}
      <Dialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmUser?.is_suspended ? "Reinstate user?" : "Suspend user?"}
            </DialogTitle>
            <DialogDescription>
              {confirmUser?.is_suspended
                ? `This will reinstate "${confirmUser.full_name}" and restore their access to the platform.`
                : `This will suspend "${confirmUser?.full_name}" and prevent them from accessing the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmUser?.is_suspended ? "default" : "destructive"}
              disabled={acting === confirmUser?.id}
              onClick={() => confirmUser && handleToggleSuspend(confirmUser)}
            >
              {confirmUser?.is_suspended ? "Reinstate" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
