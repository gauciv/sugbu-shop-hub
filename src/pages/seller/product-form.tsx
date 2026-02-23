import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { createProduct, updateProduct, getProductById } from "@/api/products";
import { getCategories } from "@/api/categories";
import { uploadProductImage } from "@/api/storage";
import { toast } from "sonner";
import { Loader2, Upload, X, ArrowLeft } from "lucide-react";
import type { Category } from "@/types";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  compare_at_price: string;
  stock: string;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [shopId, setShopId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!profile) return;
        const [cats, shop] = await Promise.all([getCategories(), getMyShop(profile.id)]);
        setCategories(cats);
        if (shop) setShopId(shop.id);

        if (id) {
          const product = await getProductById(id);
          setValue("name", product.name);
          setValue("description", product.description ?? "");
          setValue("price", String(product.price));
          setValue("compare_at_price", product.compare_at_price ? String(product.compare_at_price) : "");
          setValue("stock", String(product.stock));
          setCategoryId(product.category_id ?? "");
          setImageUrls(product.image_urls);
        }
      } finally {
        setPageLoading(false);
      }
    })();
  }, [profile, id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadProductImage(f))
      );
      setImageUrls((prev) => [...prev, ...urls]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ProductFormData) {
    setLoading(true);
    try {
      const payload = {
        shop_id: shopId,
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        stock: parseInt(data.stock, 10),
        category_id: categoryId || null,
        image_urls: imageUrls,
      };

      if (isEditing && id) {
        const { shop_id: _, ...updates } = payload;
        await updateProduct(id, updates);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      navigate("/seller/products");
    } catch {
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/seller/products")} className="text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Product" : "Add Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input {...register("name", { required: "Name is required" })} placeholder="e.g. Dried Mangoes" className="border-border/60" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Describe your product..." rows={3} className="border-border/60" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="border-border/60">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (PHP)</Label>
                <Input type="number" step="0.01" min="0" {...register("price", { required: "Price is required" })} placeholder="0.00" className="border-border/60" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Compare at Price</Label>
                <Input type="number" step="0.01" min="0" {...register("compare_at_price")} placeholder="Original price" className="border-border/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min="0" {...register("stock", { required: "Stock is required" })} placeholder="0" className="border-border/60" />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/60">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border/60 text-muted-foreground hover:border-violet-300 hover:bg-violet-50/50">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:from-violet-700 hover:to-fuchsia-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
