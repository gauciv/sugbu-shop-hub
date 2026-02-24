import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Upload, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [logoJustUploaded, setLogoJustUploaded] = useState(false);
  const [bannerJustUploaded, setBannerJustUploaded] = useState(false);

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
  }, [profile, setValue]);

  async function handleUpload(file: File, type: "logo" | "banner") {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingBanner;
    const setJustUploaded = type === "logo" ? setLogoJustUploaded : setBannerJustUploaded;
    setUploading(true);
    try {
      const url = await uploadShopAsset(file, type);
      if (type === "logo") setLogoUrl(url);
      else setBannerUrl(url);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2500);
      toast.success(`${type === "logo" ? "Logo" : "Banner"} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ShopFormData) {
    if (!profile) return;
    setLoading(true);
    const isCreating = !shop;
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
        toast.success("Shop created! Redirecting to dashboard...");
      }
    } catch {
      toast.error("Failed to save shop");
    } finally {
      setLoading(false);
      if (isCreating) {
        setTimeout(() => navigate("/seller/dashboard"), 1200);
      }
    }
  }

  if (pageLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>;
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
          {/* Banner upload */}
          <div>
            <Label className="mb-2 block">Banner</Label>
            <div className="relative h-32 overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-gradient-to-br from-lavender-50 via-lavender-100 to-purple-50 transition-colors hover:border-purple-300">
              {bannerUrl && <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />}
              <label className={cn(
                "absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 transition-colors",
                bannerUrl ? "bg-black/0 hover:bg-black/20" : "hover:bg-purple-100/50",
                uploadingBanner && "pointer-events-none"
              )}>
                {uploadingBanner ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">Uploading...</span>
                  </div>
                ) : bannerJustUploaded ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">Uploaded</span>
                  </div>
                ) : (
                  <div className={cn("flex flex-col items-center gap-1", bannerUrl && "text-white drop-shadow-sm")}>
                    {bannerUrl ? <Upload className="h-5 w-5" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                    <span className={cn("text-xs font-medium", bannerUrl ? "" : "text-muted-foreground")}>
                      {bannerUrl ? "Change banner" : "Click to upload banner"}
                    </span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "banner")} disabled={uploadingBanner} />
              </label>
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <Label className="mb-2 block">Logo</Label>
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-purple-50 transition-colors hover:border-purple-300">
              {logoUrl && <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />}
              <label className={cn(
                "absolute inset-0 flex cursor-pointer flex-col items-center justify-center transition-colors",
                logoUrl ? "bg-black/0 hover:bg-black/20" : "hover:bg-purple-100/50",
                uploadingLogo && "pointer-events-none"
              )}>
                {uploadingLogo ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                ) : logoJustUploaded ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Upload className={cn("h-5 w-5", logoUrl ? "text-white drop-shadow-sm" : "text-muted-foreground")} />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logo")} disabled={uploadingLogo} />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              className="w-full shadow-sm hover:-translate-y-0.5 hover:shadow-md"
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
