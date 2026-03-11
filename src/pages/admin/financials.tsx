import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getCommissionRate,
  setCommissionRate,
  getTransactionLog,
  getSellerPayoutSummaries,
  createPayout,
  getAllPayouts,
  markPayoutPaid,
  type TransactionLogEntry,
} from "@/api/payouts";
import type { Payout, SellerPayoutSummary } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Settings,
  Receipt,
  Banknote,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 8;

const TABS = [
  { key: "log", label: "Transaction Log", icon: Receipt },
  { key: "commission", label: "Commission Settings", icon: Settings },
  { key: "payouts", label: "Payout Management", icon: Banknote },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    return_requested: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
        map[status] ?? "bg-slate-100 text-slate-600"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Tab 1: Transaction Log ──────────────────────────────────────────────────

function TransactionLogTab() {
  const [entries, setEntries] = useState<TransactionLogEntry[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      getTransactionLog({ page: p, pageSize: PAGE_SIZE })
        .then(({ entries, count }) => {
          setEntries(entries);
          setCount(count);
        })
        .catch(() => toast.error("Failed to load transaction log"))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{count} total transactions</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions"
          description="No orders have been placed yet."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_120px_140px_100px_80px_90px] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Order</div>
            <div>Shop</div>
            <div>Buyer</div>
            <div className="text-right">Gross Rev.</div>
            <div className="text-center">Status</div>
            <div>Date</div>
          </div>

          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={cn(
                "flex flex-col gap-1 px-4 py-3 text-sm lg:grid lg:grid-cols-[1fr_120px_140px_100px_80px_90px] lg:items-center lg:gap-3",
                i < entries.length - 1 ? "border-b border-border/30" : ""
              )}
            >
              <div>
                <p className="font-semibold">{entry.order_number}</p>
                <p className="text-xs text-muted-foreground lg:hidden">
                  {entry.shop_name} · {entry.buyer_name}
                </p>
              </div>
              <div className="hidden truncate text-muted-foreground lg:block">
                {entry.shop_name}
              </div>
              <div className="hidden truncate text-muted-foreground lg:block">
                {entry.buyer_name}
              </div>
              <div className="text-right font-medium">
                {formatPrice(entry.gross_revenue)}
              </div>
              <div className="flex justify-start lg:justify-center">
                <StatusBadge status={entry.status} />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(entry.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

// ─── Tab 2: Commission Settings ───────────────────────────────────────────────

function CommissionSettingsTab() {
  const [rate, setRate] = useState<string>("");
  const [original, setOriginal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    getCommissionRate()
      .then((r) => {
        setOriginal(r);
        setRate(r.toString());
      })
      .catch(() => toast.error("Failed to load commission rate"))
      .finally(() => setLoading(false));
  }, []);

  const parsed = parseFloat(rate);
  const isDirty = !isNaN(parsed) && parsed !== original;
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 100;

  async function handleSave() {
    setSaving(true);
    try {
      await setCommissionRate(parsed);
      setOriginal(parsed);
      setConfirmOpen(false);
      toast.success(`Commission rate updated to ${parsed}%`);
    } catch {
      toast.error("Failed to update commission rate");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Platform Commission Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This rate is deducted from each seller's gross revenue (order total
            minus shipping fee) when calculating their net payout. Changes apply
            to future payouts only.
          </p>

          <div className="space-y-2">
            <Label htmlFor="rate">Commission Rate (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            {!isValid && rate !== "" && (
              <p className="text-xs text-red-500">
                Rate must be between 0 and 100.
              </p>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <p className="text-muted-foreground">Current rate</p>
            <p className="text-xl font-bold text-indigo-600">{original}%</p>
          </div>

          <Button
            disabled={!isDirty || !isValid || saving}
            onClick={() => setConfirmOpen(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Commission Rate
          </Button>
        </CardContent>
      </Card>

      {/* Example calculation */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Example Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[1000, 5000, 10000].map((gross) => {
            const commission = gross * (parsed / 100);
            const net = gross - commission;
            return (
              <div
                key={gross}
                className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-muted-foreground">
                  {formatPrice(gross)} gross
                </span>
                <span>
                  <span className="text-red-500">
                    -{formatPrice(isNaN(commission) ? 0 : commission)}
                  </span>{" "}
                  →{" "}
                  <span className="font-semibold text-green-600">
                    {formatPrice(isNaN(net) ? gross : net)}
                  </span>
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Commission Rate Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              You are changing the commission rate from{" "}
              <strong className="text-foreground">{original}%</strong> to{" "}
              <strong className="text-indigo-600">{parsed}%</strong>.
            </p>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This affects all future payout calculations. Existing payouts
                are not recalculated.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab 3: Payout Management ─────────────────────────────────────────────────

function PayoutManagementTab() {
  const [commissionRate, setCommissionRateState] = useState<number>(0);
  const [summaries, setSummaries] = useState<SellerPayoutSummary[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Create payout dialog state
  const [createTarget, setCreateTarget] = useState<SellerPayoutSummary | null>(null);
  const [periodLabel, setPeriodLabel] = useState("");
  const [creating, setCreating] = useState(false);

  // Mark paid dialog state
  const [payTarget, setPayTarget] = useState<Payout | null>(null);
  const [txRef, setTxRef] = useState("");
  const [marking, setMarking] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const rate = await getCommissionRate();
      setCommissionRateState(rate);
      const [sums, pays] = await Promise.all([
        getSellerPayoutSummaries(rate),
        getAllPayouts(),
      ]);
      setSummaries(sums);
      setPayouts(pays);
    } catch {
      toast.error("Failed to load payout data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreatePayout() {
    if (!createTarget || !periodLabel.trim()) return;
    setCreating(true);
    try {
      await createPayout(
        createTarget.shop_id,
        createTarget.seller_id,
        periodLabel.trim(),
        createTarget,
        commissionRate
      );
      toast.success(`Payout created for ${createTarget.shop_name}`);
      setCreateTarget(null);
      setPeriodLabel("");
      await loadAll();
    } catch {
      toast.error("Failed to create payout");
    } finally {
      setCreating(false);
    }
  }

  async function handleMarkPaid() {
    if (!payTarget || !txRef.trim()) return;
    setMarking(true);
    try {
      await markPayoutPaid(payTarget.id, txRef.trim());
      toast.success("Payout marked as paid");
      setPayTarget(null);
      setTxRef("");
      await loadAll();
    } catch {
      toast.error("Failed to mark payout as paid");
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const paidPayouts = payouts.filter((p) => p.status === "paid");

  return (
    <div className="space-y-8">
      {/* Section 1: Pending payouts to create */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Pending Payouts to Create</h2>
          {summaries.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              {summaries.length} shop{summaries.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Shops with delivered orders not yet assigned to a payout. Commission
          rate: <strong>{commissionRate}%</strong>
        </p>

        {summaries.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            <p className="text-sm text-green-700">
              All delivered orders have been included in a payout.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_110px_110px_110px_auto] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Shop</div>
              <div className="text-center">Orders</div>
              <div className="text-right">Gross</div>
              <div className="text-right">Commission</div>
              <div className="text-right">Net to Seller</div>
              <div />
            </div>
            {summaries.map((s, i) => (
              <div
                key={s.shop_id}
                className={cn(
                  "flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_80px_110px_110px_110px_auto] sm:items-center sm:gap-3",
                  i < summaries.length - 1 ? "border-b border-border/30" : ""
                )}
              >
                <div>
                  <p className="font-medium">{s.shop_name}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {s.unpaid_order_count} orders · Net:{" "}
                    {formatPrice(s.net_amount)}
                  </p>
                </div>
                <div className="hidden text-center text-sm text-muted-foreground sm:block">
                  {s.unpaid_order_count}
                </div>
                <div className="hidden text-right text-sm sm:block">
                  {formatPrice(s.gross_amount)}
                </div>
                <div className="hidden text-right text-sm text-red-500 sm:block">
                  -{formatPrice(s.commission_amount)}
                </div>
                <div className="hidden text-right text-sm font-semibold text-green-600 sm:block">
                  {formatPrice(s.net_amount)}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => {
                      setCreateTarget(s);
                      setPeriodLabel(
                        new Date().toLocaleString("en-PH", {
                          month: "long",
                          year: "numeric",
                        })
                      );
                    }}
                  >
                    Create Payout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Section 2: Payout history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Payout History</h2>
          {pendingPayouts.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              {pendingPayouts.length} pending
            </Badge>
          )}
        </div>

        {payouts.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No payouts yet"
            description="Created payouts will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px_110px_80px_100px_auto] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Shop · Period</div>
              <div>Created</div>
              <div className="text-right">Net Amount</div>
              <div className="text-center">Rate</div>
              <div className="text-center">Status</div>
              <div />
            </div>
            {payouts.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col gap-1 px-4 py-3 sm:grid sm:grid-cols-[1fr_120px_110px_80px_100px_auto] sm:items-center sm:gap-3",
                  i < payouts.length - 1 ? "border-b border-border/30" : ""
                )}
              >
                <div>
                  <p className="font-medium">
                    {(p.shop as { name: string } | undefined)?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.period_label}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(p.created_at)}
                </div>
                <div className="text-right font-semibold text-green-600">
                  {formatPrice(p.net_amount)}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {p.commission_rate}%
                </div>
                <div className="flex justify-center">
                  {p.status === "paid" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  {p.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => {
                        setPayTarget(p);
                        setTxRef("");
                      }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {p.status === "paid" && p.transaction_ref && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {p.transaction_ref}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Payout Dialog */}
      <Dialog
        open={!!createTarget}
        onOpenChange={(open) => !open && setCreateTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payout — {createTarget?.shop_name}</DialogTitle>
          </DialogHeader>
          {createTarget && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="period">Period Label</Label>
                <Input
                  id="period"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. March 2026"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orders included</span>
                  <span className="font-medium">
                    {createTarget.unpaid_order_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross revenue</span>
                  <span>{formatPrice(createTarget.gross_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Commission ({commissionRate}%)
                  </span>
                  <span className="text-red-500">
                    -{formatPrice(createTarget.commission_amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Net to Seller</span>
                  <span className="text-green-600">
                    {formatPrice(createTarget.net_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateTarget(null)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePayout}
              disabled={creating || !periodLabel.trim()}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payout as Paid</DialogTitle>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/60 bg-slate-50 p-4 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Shop:</span>{" "}
                  <strong>
                    {(payTarget.shop as { name: string } | undefined)?.name ?? "—"}
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Period:</span>{" "}
                  {payTarget.period_label}
                </p>
                <p>
                  <span className="text-muted-foreground">Net amount:</span>{" "}
                  <strong className="text-green-600">
                    {formatPrice(payTarget.net_amount)}
                  </strong>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="txref">Transaction Reference</Label>
                <Input
                  id="txref"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. GCash-20260311-ABC123"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a mock transaction ID or reference number for record-keeping.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayTarget(null)}
              disabled={marking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={marking || !txRef.trim()}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {marking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminFinancialsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("log");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Financials
        </h1>
        <p className="text-sm text-muted-foreground">
          Transaction log, commission settings, and seller payouts
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/40">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "log" && <TransactionLogTab />}
      {activeTab === "commission" && <CommissionSettingsTab />}
      {activeTab === "payouts" && <PayoutManagementTab />}
    </div>
  );
}
