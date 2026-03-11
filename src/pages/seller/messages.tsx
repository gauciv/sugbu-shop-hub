import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyConversations,
  getMessages,
  sendMessage,
  markMessagesRead,
} from "@/api/messages";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth";
import { getInitials, cn } from "@/lib/utils";
import { MessageSquare, SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types";

export default function SellerMessagesPage() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get("conv");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    initialConvId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const loadConversations = useCallback(async () => {
    if (!profile) return;
    const convs = await getMyConversations(profile.id);
    setConversations(convs);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    loadConversations().finally(() => setLoadingConvs(false));
  }, [profile, loadConversations]);

  useEffect(() => {
    if (initialConvId && !activeConvId) {
      setActiveConvId(initialConvId);
    }
  }, [initialConvId, activeConvId]);

  useEffect(() => {
    if (!activeConvId || !profile) return;
    setLoadingMsgs(true);
    getMessages(activeConvId)
      .then((msgs) => {
        setMessages(msgs);
        markMessagesRead(activeConvId, profile.id).then(loadConversations);
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId, profile, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeConvId) return;

    channelRef.current?.unsubscribe();

    const channel = supabase
      .channel(`seller-messages-${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
            .eq("id", newMsg.id)
            .single();
          if (data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data as unknown as Message];
            });
            if (profile && newMsg.sender_id !== profile.id) {
              markMessagesRead(activeConvId, profile.id).then(loadConversations);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [activeConvId, profile, loadConversations]);

  async function handleSend() {
    if (!activeConvId || !profile || !input.trim()) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await sendMessage(activeConvId, profile.id, content);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      loadConversations();
    } catch {
      toast.error("Failed to send message");
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  if (!profile) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
      {/* Left: Conversation list */}
      <div
        className={cn(
          "flex w-full flex-col border-r border-border/60 md:w-72 lg:w-80",
          activeConvId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="font-semibold">Customer Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="space-y-2 p-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                Conversations started by buyers will appear here.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const buyer = conv.buyer;
              const buyerName =
                (buyer as { full_name?: string } | undefined)?.full_name ??
                "Customer";
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    isActive ? "bg-pink-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          (buyer as { avatar_url?: string } | undefined)
                            ?.avatar_url ?? undefined
                        }
                      />
                      <AvatarFallback className="bg-pink-100 text-xs font-semibold text-pink-600">
                        {getInitials(buyerName)}
                      </AvatarFallback>
                    </Avatar>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{buyerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.last_message_preview ?? "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Message thread */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !activeConvId ? "hidden md:flex" : "flex"
        )}
      >
        {!activeConvId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              Select a conversation to reply
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <button
                className="md:hidden text-muted-foreground"
                onClick={() => setActiveConvId(null)}
              >
                ←
              </button>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    (
                      activeConversation?.buyer as {
                        avatar_url?: string;
                      } | undefined
                    )?.avatar_url ?? undefined
                  }
                />
                <AvatarFallback className="bg-pink-100 text-xs text-pink-600">
                  {getInitials(
                    (
                      activeConversation?.buyer as {
                        full_name?: string;
                      } | undefined
                    )?.full_name ?? "?"
                  )}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold">
                {(
                  activeConversation?.buyer as {
                    full_name?: string;
                  } | undefined
                )?.full_name ?? "Customer"}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-2/3 rounded-2xl" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No messages yet.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === profile.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage
                            src={
                              (
                                msg.sender as { avatar_url?: string } | undefined
                              )?.avatar_url ?? undefined
                            }
                          />
                          <AvatarFallback className="text-[10px] bg-slate-100">
                            {getInitials(
                              (
                                msg.sender as { full_name?: string } | undefined
                              )?.full_name ?? "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[72%] rounded-2xl px-3.5 py-2 text-sm",
                          isMe
                            ? "rounded-br-sm bg-pink-500 text-white"
                            : "rounded-bl-sm bg-slate-100 text-foreground"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/60 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-full"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !input.trim()}
                  className="h-9 w-9 shrink-0 rounded-full bg-pink-500 text-white hover:bg-pink-600"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizonal className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
