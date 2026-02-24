import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopProducts, deleteProduct } from "@/api/products";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Product, Shop } from "@/types";

export default function SellerProducts() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!profile) return;
    try {
      const s = await getMyShop(profile.id);
      setShop(s);
      if (s) {
        const p = await getShopProducts(s.id);
        setProducts(p);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [profile]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  if (!shop) {
    return (
      <EmptyState
        icon={ImageOff}
        title="Create your shop first"
        description="You need to set up your shop before adding products."
        action={{ label: "Shop Settings", onClick: () => navigate("/seller/shop-settings") }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Link to="/seller/products/new">
          <Button className="shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="No products yet"
          description="Start adding products to your shop."
          action={{ label: "Add Product", onClick: () => navigate("/seller/products/new") }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-lavender-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="w-10">Image</div>
            <div>Product</div>
            <div className="w-20 text-right">Price</div>
            <div className="w-16 text-right">Stock</div>
            <div className="w-20 text-right">Actions</div>
          </div>
          {/* Product rows */}
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-lavender-50/50 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] ${i < products.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-lavender-100">
                {product.image_urls[0] ? (
                  <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                  <Badge variant={product.is_active ? "default" : "secondary"} className={`shrink-0 text-[10px] ${product.is_active ? "bg-green-100 text-green-800 border-0" : ""}`}>
                    {product.is_active ? "Active" : "Draft"}
                  </Badge>
                </div>
                {/* Mobile-only price + stock */}
                <p className="text-xs text-muted-foreground sm:hidden">
                  {formatPrice(product.price)} &middot; {product.stock} in stock
                </p>
              </div>
              <div className="hidden w-20 text-right text-sm font-medium sm:block">
                {formatPrice(product.price)}
              </div>
              <div className="hidden w-16 text-right text-sm text-muted-foreground sm:block">
                {product.stock}
              </div>
              <div className="flex w-20 items-center justify-end gap-0.5">
                <Link to={`/seller/products/${product.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
