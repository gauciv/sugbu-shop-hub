import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminProducts, adminToggleProduct, adminDeleteProduct } from "@/api/admin";
import { useDebounce } from "@/hooks/use-debounce";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Package,
  Search,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import type { Product } from "@/types";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    getAdminProducts({ query: debouncedQuery, page, pageSize: PAGE_SIZE })
      .then(({ products: p, count: c }) => {
        setProducts(p);
        setCount(c);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, page]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  async function handleToggle(product: Product) {
    setActing(product.id);
    try {
      const updated = await adminToggleProduct(product.id, !product.is_active);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: updated.is_active } : p))
      );
      toast.success(updated.is_active ? "Product activated" : "Product deactivated");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setActing(product.id);
    try {
      await adminDeleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setCount((c) => c - 1);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{count} total products</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 border-border/60"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={query ? "No products match your search." : "No products on the platform yet."}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-3 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="w-10">Image</div>
            <div>Product</div>
            <div className="w-28 truncate">Shop</div>
            <div className="w-20 truncate">Category</div>
            <div className="w-20 text-right">Price</div>
            <div className="w-16 text-center">Status</div>
            <div className="w-20 text-right">Actions</div>
          </div>

          {products.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] sm:gap-3",
                i < products.length - 1 ? "border-b border-border/30" : ""
              )}
            >
              {/* Image */}
              <div className="hidden h-10 w-10 overflow-hidden rounded-lg bg-slate-100 sm:block">
                {product.image_urls?.[0] ? (
                  <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Shop */}
              <div className="hidden w-28 truncate text-xs text-muted-foreground sm:block">
                {(product.shop as { name: string } | undefined)?.name ?? "—"}
              </div>

              {/* Category */}
              <div className="hidden w-20 truncate text-xs text-muted-foreground sm:block">
                {(product.category as { name: string } | undefined)?.name ?? "—"}
              </div>

              {/* Price */}
              <div className="hidden w-20 text-right text-sm font-medium sm:block">
                {formatPrice(product.price)}
              </div>

              {/* Status toggle badge */}
              <div className="flex w-16 justify-center">
                <button
                  disabled={acting === product.id}
                  onClick={() => handleToggle(product)}
                  title={product.is_active ? "Click to deactivate" : "Click to activate"}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0 text-[11px] cursor-pointer transition-opacity",
                      acting === product.id && "opacity-50 cursor-not-allowed",
                      product.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    )}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </button>
              </div>

              {/* Delete */}
              <div className="flex w-20 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={acting === product.id}
                  onClick={() => handleDelete(product)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border-border/60"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="px-4 text-sm tabular-nums text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border-border/60"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
