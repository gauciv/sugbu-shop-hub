import { supabase } from "@/lib/supabase";
import type { SupportTicket, TicketMessage } from "@/types";

// ─── Admin: All Tickets ───────────────────────────────────────────────────────

export async function getAllTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*, submitter:profiles!submitted_by(id, full_name, email, avatar_url, role)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SupportTicket[];
}

// ─── User: Own Tickets ────────────────────────────────────────────────────────

export async function getMyTickets(userId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupportTicket[];
}

// ─── Ticket Detail ────────────────────────────────────────────────────────────

export async function getTicketById(id: string): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "*, submitter:profiles!submitted_by(id, full_name, email, avatar_url, role), order:orders(id, order_number, status)"
    )
    .eq("id", id)
    .single();
  if (error) throw error;

  const messages = await getTicketMessages(id);
  return { ...(data as unknown as SupportTicket), messages };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getTicketMessages(
  ticketId: string
): Promise<TicketMessage[]> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*, sender:profiles!sender_id(id, full_name, avatar_url, role)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as TicketMessage[];
}

export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  message: string
): Promise<TicketMessage> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: ticketId, sender_id: senderId, message })
    .select("*, sender:profiles!sender_id(id, full_name, avatar_url, role)")
    .single();
  if (error) throw error;
  return data as unknown as TicketMessage;
}

// ─── Create Ticket ────────────────────────────────────────────────────────────

export async function createTicket(input: {
  submitted_by: string;
  submitted_by_role: "buyer" | "seller";
  type: string;
  subject: string;
  description: string;
  related_order_id?: string | null;
}): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from("support_tickets")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as SupportTicket;
}

// ─── Admin: Update Status / Priority ─────────────────────────────────────────

export async function updateTicketStatus(
  id: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function updateTicketPriority(
  id: string,
  priority: string
): Promise<void> {
  const { error } = await supabase
    .from("support_tickets")
    .update({ priority })
    .eq("id", id);
  if (error) throw error;
}
