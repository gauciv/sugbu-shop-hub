import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="flex items-center gap-4 border-border/60 p-4">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-lavender-100">
                {product.image_urls[0] ? (
                  <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                  <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-green-100 text-green-800 border-0" : ""}>
                    {product.is_active ? "Active" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price)} &middot; {product.stock} in stock
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/seller/products/${product.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
