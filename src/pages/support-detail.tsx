import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getTicketById, addTicketMessage } from "@/api/support";
import {
  TICKET_STATUS_CONFIG,
  TICKET_TYPE_CONFIG,
  TICKET_PRIORITY_CONFIG,
  type TicketStatus,
  type TicketType,
  type TicketPriority,
} from "@/lib/constants";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { ArrowLeft, Loader2, SendHorizonal, Info } from "lucide-react";
import { toast } from "sonner";
import type { SupportTicket, TicketMessage } from "@/types";

export default function SupportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getTicketById(id)
      .then(setTicket)
      .catch(() => toast.error("Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const isClosed =
    ticket?.status === "closed" || ticket?.status === "resolved";

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

  if (loading || !ticket) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const messages: TicketMessage[] = ticket.messages ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/support")}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Support
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
              TICKET_STATUS_CONFIG[ticket.status as TicketStatus]?.color ??
                "bg-slate-100 text-slate-600"
            )}
          >
            {TICKET_STATUS_CONFIG[ticket.status as TicketStatus]?.label}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
          <span>
            {TICKET_TYPE_CONFIG[ticket.type as TicketType]?.label}
          </span>
          <span>·</span>
          <span>
            Priority:{" "}
            {TICKET_PRIORITY_CONFIG[ticket.priority as TicketPriority]?.label}
          </span>
          <span>·</span>
          <span>{formatDate(ticket.created_at)}</span>
        </div>
      </div>

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

      {/* Closed/resolved banner */}
      {isClosed && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-800">
            This ticket has been{" "}
            {ticket.status === "resolved" ? "resolved" : "closed"}. If you still
            need help, please submit a new ticket.
          </p>
        </div>
      )}

      <Separator />

      {/* Message thread */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">
          Conversation ({messages.length} message
          {messages.length !== 1 ? "s" : ""})
        </h2>

        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No replies yet. The admin team will respond here.
          </p>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isAdmin = msg.sender?.role === "admin";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  isAdmin ? "flex-row" : "flex-row-reverse"
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
                    isAdmin ? "items-start" : "items-end"
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] text-muted-foreground",
                      isAdmin ? "text-left" : "text-right"
                    )}
                  >
                    {isAdmin ? "Admin" : msg.sender?.full_name ?? "You"} ·{" "}
                    {formatDate(msg.created_at)}
                  </p>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm",
                      isAdmin
                        ? "rounded-tl-sm bg-indigo-500 text-white"
                        : "rounded-tr-sm bg-slate-100 text-foreground"
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
        {!isClosed && (
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
        )}
      </div>
    </div>
  );
}
