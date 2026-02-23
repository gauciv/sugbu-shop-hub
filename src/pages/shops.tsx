import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ShopCard } from "@/components/shared/shop-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getActiveShops, searchShops } from "@/api/shops";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop } from "@/types";

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setLoading(true);
    const fetcher = debouncedQuery ? searchShops(debouncedQuery) : getActiveShops();
    fetcher.then(setShops).finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-lavender-100/50 to-pink-50/30 px-6 py-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Discover Cozy Local Shops</h1>
        <p className="mt-2 text-sm text-muted-foreground">Handpicked small businesses from all around Cebu</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-full border-border/60 pl-10 h-11 focus-visible:ring-purple-400/20"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
