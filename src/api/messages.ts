import { supabase } from "@/lib/supabase";
import type { Conversation, Message } from "@/types";

// ─── Conversations ────────────────────────────────────────────────────────────

export async function getOrCreateConversation(
  buyerId: string,
  shopId: string,
  sellerId: string,
  productId?: string
): Promise<Conversation> {
  // Try to find existing conversation first
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("buyer_id", buyerId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (existing) return existing as Conversation;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: buyerId,
      shop_id: shopId,
      seller_id: sellerId,
      product_id: productId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function getMyConversations(
  userId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "*, buyer:profiles!buyer_id(id, full_name, avatar_url), seller:profiles!seller_id(id, full_name, avatar_url), shop:shops(id, name, slug, logo_url)"
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;

  // Attach unread_count per conversation
  const convs = (data ?? []) as unknown as Conversation[];
  const counts = await Promise.all(
    convs.map((c) =>
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .eq("is_read", false)
        .neq("sender_id", userId)
        .then(({ count }) => ({ id: c.id, count: count ?? 0 }))
    )
  );

  const countMap: Record<string, number> = {};
  for (const { id, count } of counts) countMap[id] = count;

  return convs.map((c) => ({ ...c, unread_count: countMap[c.id] ?? 0 }));
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:profiles!sender_id(id, full_name, avatar_url)"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Message[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
    .single();

  if (error) throw error;

  // Update conversation last_message_at and preview
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview:
        content.length > 60 ? content.slice(0, 60) + "…" : content,
    })
    .eq("id", conversationId);

  return data as unknown as Message;
}

export async function markMessagesRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", currentUserId);
}
