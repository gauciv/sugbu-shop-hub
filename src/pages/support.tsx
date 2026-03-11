import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { createTicket, getMyTickets } from "@/api/support";
import {
  TICKET_TYPE_CONFIG,
  TICKET_TYPES,
  TICKET_STATUS_CONFIG,
  type TicketStatus,
  type TicketType,
} from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import {
  Loader2,
  MessageSquare,
  Plus,
  Inbox,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { SupportTicket } from "@/types";

const PAGE_SIZE = 8;

export default function SupportPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"tickets" | "submit">("tickets");

  // ─── My Tickets state ──────────────────────────────────────────────
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [page, setPage] = useState(1);

  // ─── Submit form state ─────────────────────────────────────────────
  const [type, setType] = useState<string>("general");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [relatedOrderId, setRelatedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile || profile.role === "admin") return;
    setLoadingTickets(true);
    getMyTickets(profile.id)
      .then(setTickets)
      .finally(() => setLoadingTickets(false));
  }, [profile]);

  useEffect(() => {
    if (!loadingTickets && tickets.length === 0) {
      setActiveTab("submit");
    }
  }, [loadingTickets, tickets.length]);

  if (!profile || profile.role === "admin") {
    return <Navigate to="/" replace />;
  }

  async function refetchTickets() {
    const t = await getMyTickets(profile!.id);
    setTickets(t);
  }

  const totalPages = Math.ceil(tickets.length / PAGE_SIZE);
  const paginated = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isFormValid =
    subject.trim().length > 0 && description.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || !profile) return;
    setSubmitting(true);
    try {
      await createTicket({
        submitted_by: profile.id,
        submitted_by_role: profile.role as "buyer" | "seller",
        type,
        subject: subject.trim(),
        description: description.trim(),
        related_order_id: relatedOrderId.trim() || null,
      });
      toast.success("Your support ticket has been submitted.");
      setSubject("");
      setDescription("");
      setRelatedOrderId("");
      setType("general");
      await refetchTickets();
      setActiveTab("tickets");
    } catch {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const TABS = [
    { key: "tickets" as const, label: "My Tickets", icon: Inbox },
    { key: "submit" as const, label: "Submit Ticket", icon: Plus },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Support
          </h1>
          <p className="text-sm text-muted-foreground">
            View your tickets or submit a new issue.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40 pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-indigo-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.key === "tickets" && tickets.length > 0 && (
                <span
                  className={cn(
                    "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tickets.length}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── My Tickets Tab ───────────────────────────────────────────── */}
      {activeTab === "tickets" && (
        <>
          {loadingTickets ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No tickets yet"
              description="You haven't submitted any support tickets."
              action={{
                label: "Submit a Ticket",
                onClick: () => setActiveTab("submit"),
              }}
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <div>Subject</div>
                  <div className="w-28">Type</div>
                  <div className="w-20 text-center">Status</div>
                  <div className="w-24">Date</div>
                  <div className="w-10" />
                </div>

                {paginated.map((ticket, i) => (
                  <Link
                    key={ticket.id}
                    to={`/support/${ticket.id}`}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/80 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-3",
                      i < paginated.length - 1
                        ? "border-b border-border/30"
                        : ""
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {TICKET_TYPE_CONFIG[ticket.type as TicketType]?.label} ·{" "}
                        {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <div className="hidden w-28 truncate text-xs text-muted-foreground sm:block">
                      {TICKET_TYPE_CONFIG[ticket.type as TicketType]?.label}
                    </div>
                    <div className="flex w-20 justify-center">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          TICKET_STATUS_CONFIG[ticket.status as TicketStatus]
                            ?.color ?? "bg-slate-100 text-slate-600"
                        )}
                      >
                        {TICKET_STATUS_CONFIG[ticket.status as TicketStatus]
                          ?.label ?? ticket.status}
                      </span>
                    </div>
                    <div className="hidden w-24 text-xs text-muted-foreground sm:block">
                      {formatDate(ticket.created_at)}
                    </div>
                    <div className="flex w-10 justify-end">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
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
            </>
          )}
        </>
      )}

      {/* ─── Submit Ticket Tab ────────────────────────────────────────── */}
      {activeTab === "submit" && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div className="space-y-1.5">
                <Label htmlFor="type">Category</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {TICKET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TICKET_TYPE_CONFIG[t].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  maxLength={120}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened and what you expected..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Related Order ID */}
              <div className="space-y-1.5">
                <Label htmlFor="order-id">
                  Related Order ID{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="order-id"
                  value={relatedOrderId}
                  onChange={(e) => setRelatedOrderId(e.target.value)}
                  placeholder="Paste the Order ID if applicable"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  You can find the Order ID on your order detail page.
                </p>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
