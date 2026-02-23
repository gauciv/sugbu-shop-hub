import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ShopCard } from "@/components/shared/shop-card";
import { getActiveShops } from "@/api/shops";
import { getFeaturedProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/context/auth";
import { ArrowRight, Store, ShoppingBag, Shield, Sparkles, Shirt, Home as HomeIcon, Smartphone, Palette, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop, Product, Category } from "@/types";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Shirt,
  Home: HomeIcon,
  Smartphone,
  Sparkles,
  Palette,
};

export default function HomePage() {
  const { session } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getActiveShops(), getFeaturedProducts(8), getCategories()])
      .then(([s, p, c]) => { setShops(s); setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lavender-50 via-lavender-100 to-purple-50">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-200/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-pink-200/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-purple-500 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Supporting Cebu's small businesses
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Discover local shops in{" "}
              <span className="text-gradient">
                Sugbu
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Shop from the best small businesses in Cebu. From artisan crafts to local delicacies, find everything in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shops">
                <Button size="lg" className="bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-purple-400/15 hover:from-purple-500 hover:to-pink-500 hover:shadow-xl hover:shadow-purple-400/20">
                  Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {!session && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-purple-200 bg-white/60 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md">
                    Start Selling
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-border/40 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 divide-y divide-border/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Store, title: "Local Shops", desc: "Curated Cebu businesses" },
            { icon: Shield, title: "Trusted Sellers", desc: "Verified local merchants" },
            { icon: ShoppingBag, title: "Easy Shopping", desc: "Simple & secure checkout" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50">
                <item.icon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold tracking-tight">Shop by Category</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`}>
                    <div className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 p-4 text-center transition-all hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-100 text-purple-400 transition-colors group-hover:bg-purple-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!loading && products.length > 0 && (
        <section className="bg-gradient-to-b from-lavender-100/30 to-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">New Arrivals</h2>
              <Link to="/products">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-500">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} showShop />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Featured Shops</h2>
              <Link to="/shops">
                <Button variant="ghost" size="sm" className="text-purple-400">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shops.slice(0, 6).map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - only show for non-authenticated users */}
      {!session && (
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-pink-400 py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to start your shop?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-purple-200">
              Join Sugbu Shop Hub and reach customers across Cebu. It&apos;s free to get started.
            </p>
            <Link to="/register">
              <Button size="lg" className="mt-6 bg-white text-purple-500 shadow-lg hover:bg-purple-50">
                Create Your Shop <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
