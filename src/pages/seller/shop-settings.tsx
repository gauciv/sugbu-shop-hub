import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { getMyShop, createShop, updateShop } from "@/api/shops";
import { uploadShopAsset } from "@/api/storage";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import type { Shop } from "@/types";

interface ShopFormData {
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export default function ShopSettingsPage() {
  const { profile } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ShopFormData>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getMyShop(profile.id).then((s) => {
      setShop(s);
      if (s) {
        setValue("name", s.name);
        setValue("description", s.description ?? "");
        setValue("contact_email", s.contact_email ?? "");
        setValue("contact_phone", s.contact_phone ?? "");
        setValue("address", s.address ?? "");
        setLogoUrl(s.logo_url);
        setBannerUrl(s.banner_url);
      }
      setPageLoading(false);
    });
  }, [profile]);

  async function handleUpload(file: File, type: "logo" | "banner") {
    setUploading(true);
    try {
      const url = await uploadShopAsset(file, type);
      if (type === "logo") setLogoUrl(url);
      else setBannerUrl(url);
      toast.success(`${type === "logo" ? "Logo" : "Banner"} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ShopFormData) {
    if (!profile) return;
    setLoading(true);
    try {
      if (shop) {
        const updated = await updateShop(shop.id, {
          name: data.name,
          slug: slugify(data.name),
          description: data.description || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        });
        setShop(updated);
        toast.success("Shop updated");
      } else {
        const created = await createShop({
          owner_id: profile.id,
          name: data.name,
          slug: slugify(data.name),
          description: data.description || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
        });
        setShop(created);
        toast.success("Shop created!");
      }
    } catch {
      toast.error("Failed to save shop");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
        <p className="text-sm text-muted-foreground">
          {shop ? "Manage your shop profile" : "Set up your shop to start selling"}
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Shop Images</CardTitle>
          <CardDescription>Upload your shop logo and banner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Banner</Label>
            <div className="relative h-32 overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-gradient-to-br from-pink-50 via-violet-50 to-violet-100">
              {bannerUrl && <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/10">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "banner")} disabled={uploading} />
              </label>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Logo</Label>
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-violet-50">
              {logoUrl && <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/10">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logo")} disabled={uploading} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Shop Name</Label>
              <Input {...register("name", { required: "Shop name is required" })} placeholder="My Awesome Shop" className="border-border/60" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Tell customers about your shop..." rows={3} className="border-border/60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("contact_email")} placeholder="shop@email.com" className="border-border/60" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("contact_phone")} placeholder="+63..." className="border-border/60" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input {...register("address")} placeholder="Cebu City, Philippines" className="border-border/60" />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:from-violet-700 hover:to-fuchsia-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {shop ? "Update Shop" : "Create Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
