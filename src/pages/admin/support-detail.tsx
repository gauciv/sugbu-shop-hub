import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
  updateTicketPriority,
} from "@/api/support";
import { adminUpdateOrderStatus } from "@/api/admin";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_TYPE_CONFIG,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  ORDER_STATUSES,
  ORDER_STATUS_CONFIG,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import {
  ArrowLeft,
  Loader2,
  SendHorizonal,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { SupportTicket, TicketMessage } from "@/types";

export default function AdminSupportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus>("pending");
  const [overriding, setOverriding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getTicketById(id)
      .then((t) => {
        setTicket(t);
        if (t.order) setOverrideStatus(t.order.status as OrderStatus);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function handleReply() {
    if (!ticket || !profile || !reply.trim()) return;
    setSending(true);
    try {
      const msg = await addTicketMessage(ticket.id, profile.id, reply.trim());
      setTicket((prev) =>
        prev ? { ...prev, messages: [...(prev.messages ?? []), msg] } : prev
      );
      setReply("");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!ticket) return;
    try {
      await updateTicketStatus(ticket.id, status);
      setTicket((prev) => prev ? { ...prev, status: status as TicketStatus } : prev);
      toast.success(`Ticket status updated to ${TICKET_STATUS_CONFIG[status as TicketStatus]?.label}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handlePriorityChange(priority: string) {
    if (!ticket) return;
    try {
      await updateTicketPriority(ticket.id, priority);
      setTicket((prev) => prev ? { ...prev, priority: priority as TicketPriority } : prev);
      toast.success("Priority updated");
    } catch {
      toast.error("Failed to update priority");
    }
  }

  async function handleOrderOverride() {
    if (!ticket?.order) return;
    if (
      !confirm(
        `Force order ${ticket.order.order_number} to "${ORDER_STATUS_CONFIG[overrideStatus].label}"?`
      )
    )
      return;
    setOverriding(true);
    try {
      const updated = await adminUpdateOrderStatus(ticket.order.id, overrideStatus);
      setTicket((prev) =>
        prev && prev.order
          ? { ...prev, order: { ...prev.order, status: updated.status } }
          : prev
      );
      toast.success(`Order forced to ${ORDER_STATUS_CONFIG[overrideStatus].label}`);
    } catch {
      toast.error("Failed to override order status");
    } finally {
      setOverriding(false);
    }
  }

  if (loading || !ticket) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const messages: TicketMessage[] = ticket.messages ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/support")}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Support Inbox
      </Button>

      {/* Ticket header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {ticket.ticket_number}
            </p>
            <h1 className="font-display text-xl font-bold tracking-tight">
              {ticket.subject}
            </h1>
          </div>
          <span
            className={cn(
              "mt-1 shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              TICKET_STATUS_CONFIG[ticket.status]?.color ?? "bg-slate-100 text-slate-600"
            )}
          >
            {TICKET_STATUS_CONFIG[ticket.status]?.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {TICKET_TYPE_CONFIG[ticket.type as TicketType]?.label} ·{" "}
          Submitted by {ticket.submitter?.full_name ?? "—"} ·{" "}
          {formatDate(ticket.created_at)}
        </p>
      </div>

      {/* Admin Controls */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-indigo-800">
            <ShieldAlert className="h-4 w-4" />
            Admin Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-indigo-700">Status</p>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-8 rounded-md border border-indigo-200 bg-white px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-indigo-700">Priority</p>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="h-8 rounded-md border border-indigo-200 bg-white px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TICKET_PRIORITY_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Original description */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {ticket.description}
          </p>
        </CardContent>
      </Card>

      {/* Order dispute quick action */}
      {ticket.type === "order_dispute" && ticket.order && (
        <Card className="border-orange-200 bg-orange-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
              <ShieldAlert className="h-4 w-4" />
              Order Quick Action — {ticket.order.order_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-orange-600">
              Current status:{" "}
              <strong>
                {ORDER_STATUS_CONFIG[ticket.order.status as OrderStatus]?.label ??
                  ticket.order.status}
              </strong>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={overrideStatus}
                onChange={(e) =>
                  setOverrideStatus(e.target.value as OrderStatus)
                }
                className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
              <Button
                disabled={
                  overriding || overrideStatus === ticket.order?.status
                }
                onClick={handleOrderOverride}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {overriding && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Override Order Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Message thread */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">
          Conversation ({messages.length} message{messages.length !== 1 ? "s" : ""})
        </h2>

        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet. Send the first reply below.</p>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isAdmin = msg.sender?.role === "admin";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  isAdmin ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={msg.sender?.avatar_url ?? undefined} />
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      isAdmin
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {getInitials(msg.sender?.full_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] space-y-1",
                    isAdmin ? "items-end" : "items-start"
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] text-muted-foreground",
                      isAdmin ? "text-right" : "text-left"
                    )}
                  >
                    {msg.sender?.full_name ?? "—"} ·{" "}
                    {formatDate(msg.created_at)}
                  </p>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm",
                      isAdmin
                        ? "rounded-tr-sm bg-indigo-500 text-white"
                        : "rounded-tl-sm bg-slate-100 text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply form */}
        <Card className="border-border/60">
          <CardContent className="space-y-3 p-4">
            <Textarea
              placeholder="Write a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Ctrl+Enter to send
              </p>
              <Button
                disabled={sending || !reply.trim()}
                onClick={handleReply}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="mr-2 h-4 w-4" />
                )}
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
