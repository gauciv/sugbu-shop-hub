import { supabase } from "@/lib/supabase";

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadShopAsset(
  file: File,
  type: "logo" | "banner"
): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${type}-${crypto.randomUUID()}.${ext}`;
  const filePath = `shops/${fileName}`;

  const { error } = await supabase.storage
    .from("shop-assets")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("shop-assets")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
