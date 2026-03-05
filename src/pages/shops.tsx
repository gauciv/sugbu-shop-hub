import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShopCard } from "@/components/shared/shop-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getActiveShopsPaginated } from "@/api/shops";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop } from "@/types";

const PAGE_SIZE = 9;

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    getActiveShopsPaginated({ query: debouncedQuery || undefined, page, pageSize: PAGE_SIZE })
      .then(({ shops: s, count }) => {
        setShops(s);
        setTotalCount(count);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 rounded-[32px] bg-secondary px-6 py-6 shadow-cozy sm:px-8">
        <span className="font-accent text-lg text-accent">~ lovely locals ~</span>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Discover Cozy Local Shops</h1>
        <p className="mt-1.5 text-sm text-muted-foreground lg:text-base">Handpicked small businesses from all around Cebu</p>
      </div>

      <div className="relative mx-auto mb-6 max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-full border-border/60 pl-10 h-11 focus-visible:ring-pink-300/30"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No shops found"
          description={query ? `No results for "${query}"` : "No shops available yet. Check back soon!"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
