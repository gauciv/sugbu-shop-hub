import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getShopBySlug } from "@/api/shops";
import { getActiveShopProducts } from "@/api/products";
import { getInitials } from "@/lib/utils";
import { Package, MapPin, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop, Product } from "@/types";

export default function ShopDetailPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const s = await getShopBySlug(slug);
        setShop(s);
        const p = await getActiveShopProducts(s.id);
        setProducts(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-48 w-full" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return <EmptyState icon={Package} title="Shop not found" description="This shop doesn't exist or has been deactivated." />;
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-pink-100 via-violet-100 to-violet-200 sm:h-52">
        {shop.banner_url && (
          <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      {/* Shop Info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-10 flex items-end gap-4 pb-6">
          <Avatar className="h-20 w-20 border-4 border-white shadow-md sm:h-24 sm:w-24">
            <AvatarImage src={shop.logo_url ?? undefined} />
            <AvatarFallback className="bg-violet-100 text-lg font-bold text-violet-700">
              {getInitials(shop.name)}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{shop.name}</h1>
            {shop.description && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{shop.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {shop.address && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.address}</span>
              )}
              {shop.contact_email && (
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {shop.contact_email}</span>
              )}
              {shop.contact_phone && (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {shop.contact_phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="border-t border-border/60 py-8">
          <h2 className="mb-6 text-lg font-semibold">Products ({products.length})</h2>
          {products.length === 0 ? (
            <EmptyState icon={Package} title="No products" description="This shop hasn't added any products yet." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
