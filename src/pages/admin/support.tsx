import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getAllTickets } from "@/api/support";
import {
  ADMIN_TICKET_TABS,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_TYPE_CONFIG,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import {
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SupportTicket } from "@/types";

const PAGE_SIZE = 8;

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllTickets()
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  const currentTab =
    ADMIN_TICKET_TABS.find((t) => t.key === activeTab) ?? ADMIN_TICKET_TABS[0];
  const filtered = currentTab.statuses
    ? tickets.filter((t) =>
        (currentTab.statuses as readonly string[]).includes(t.status)
      )
    : tickets;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Support Inbox</h1>
        <p className="text-sm text-muted-foreground">{tickets.length} total tickets</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-border/40 pb-px">
          {ADMIN_TICKET_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.statuses
              ? tickets.filter((t) =>
                  (tab.statuses as readonly string[]).includes(t.status)
                ).length
              : tickets.length;
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
        <EmptyState
          icon={MessageSquare}
          title="No tickets"
          description="No support tickets match this filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Header */}
          <div className="hidden lg:grid lg:grid-cols-[80px_100px_1fr_120px_80px_90px_80px] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Ticket #</div>
            <div>Type</div>
            <div>Subject</div>
            <div>Submitted By</div>
            <div>Priority</div>
            <div>Status</div>
            <div />
          </div>

          {paginated.map((ticket, i) => (
            <Link
              key={ticket.id}
              to={`/admin/support/${ticket.id}`}
              className={cn(
                "flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-slate-50/80 lg:grid lg:grid-cols-[80px_100px_1fr_120px_80px_90px_80px] lg:items-center lg:gap-3",
                i < paginated.length - 1 ? "border-b border-border/30" : ""
              )}
            >
              <div className="font-mono text-xs text-muted-foreground">
                {ticket.ticket_number}
              </div>
              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {TICKET_TYPE_CONFIG[ticket.type as TicketType]?.label ?? ticket.type}
                </span>
              </div>
              <div>
                <p className="truncate text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              <div className="truncate text-sm text-muted-foreground">
                {ticket.submitter?.full_name ?? "—"}
              </div>
              <div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    TICKET_PRIORITY_CONFIG[ticket.priority as TicketPriority]?.color ??
                      "bg-slate-100 text-slate-600"
                  )}
                >
                  {ticket.priority}
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    TICKET_STATUS_CONFIG[ticket.status as TicketStatus]?.color ??
                      "bg-slate-100 text-slate-600"
                  )}
                >
                  {TICKET_STATUS_CONFIG[ticket.status as TicketStatus]?.label ??
                    ticket.status}
                </span>
              </div>
              <div className="flex justify-end">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
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
