import { supabase } from "@/lib/supabase";
import type { Address } from "@/types";

export async function getUserAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Address[];
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  if (error) throw error;
  return data as Address | null;
}

export async function createAddress(
  userId: string,
  input: { label: string; full_name: string; address: string; contact_phone?: string; is_default?: boolean }
): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function updateAddress(
  id: string,
  input: { label?: string; full_name?: string; address?: string; contact_phone?: string; is_default?: boolean }
): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}
