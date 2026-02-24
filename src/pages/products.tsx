import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { searchProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 350);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, categoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (categoryId) params.set("category", categoryId);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });

    searchProducts({ query: debouncedQuery || undefined, categoryId: categoryId || undefined, page, pageSize: PAGE_SIZE })
      .then(({ products: p, count }) => {
        if (cancelled) return;
        setProducts(p);
        setTotalCount(count);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, categoryId, page, setSearchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 rounded-2xl bg-secondary/40 px-6 py-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Browse Products
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover handpicked goodies from local shops across Sugbu
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full border-border/60 pl-10 h-11 focus-visible:ring-purple-400/20"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId("")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                !categoryId
                  ? "bg-purple-400 text-white shadow-cozy"
                  : "bg-purple-50 text-purple-500 hover:bg-purple-100 hover:shadow-sm"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                  categoryId === cat.id
                    ? "bg-purple-400 text-white shadow-cozy"
                    : "bg-purple-50 text-purple-500 hover:bg-purple-100 hover:shadow-sm"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {totalCount === 0
            ? "No products found"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}\u2013${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount} product${totalCount !== 1 ? "s" : ""}`}
          {debouncedQuery && (
            <span> for &ldquo;{debouncedQuery}&rdquo;</span>
          )}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description={
            debouncedQuery
              ? `No results match "${debouncedQuery}". Try a different search term.`
              : "No products are available at the moment. Check back soon!"
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showShop />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
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
