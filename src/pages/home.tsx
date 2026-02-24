import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ShopCard } from "@/components/shared/shop-card";
import { getActiveShops } from "@/api/shops";
import { getFeaturedProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/context/auth";
import { ArrowRight, Store, ShoppingBag, Heart, Sparkles, Shirt, Home as HomeIcon, Smartphone, Palette, UtensilsCrossed } from "lucide-react";
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
      {/* Hero — airy, warm, spacious */}
      <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
        {/* Background blobs — large, heavily blurred, barely visible */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-40 h-[400px] w-[400px] rounded-full bg-pink-100/30 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground">
                Supporting Cebu&apos;s small businesses
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                Your cozy corner{" "}
                <br className="hidden sm:block" />
                for <span className="text-gradient">local finds</span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
                Discover handpicked goodies from Cebu&apos;s favorite small businesses — artisan treats, local crafts, and everyday finds.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/shops">
                  <Button size="lg" className="rounded-full px-8 shadow-sm hover:-translate-y-0.5 hover:shadow-md">
                    Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="rounded-full border-border bg-white/80 px-8 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero image area — clean, rounded, warm */}
            <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto aspect-[4/3] max-w-lg">
                <div className="h-full w-full overflow-hidden rounded-[28px] border border-border/40 bg-gradient-to-br from-lavender-100/80 via-white to-pink-50/60 p-8 shadow-cozy">
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-cozy">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-medium text-foreground/60">Your hero image goes here</p>
                    <p className="text-sm text-muted-foreground">Upload a cozy image to personalize this space</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props — clean, no borders, breathing room */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            {[
              { icon: Store, title: "Local Shops", desc: "Curated businesses from all around Cebu, handpicked with care" },
              { icon: Heart, title: "Trusted Sellers", desc: "Every merchant is verified so you can shop with confidence" },
              { icon: ShoppingBag, title: "Easy Shopping", desc: "A simple, cozy experience from browsing to doorstep delivery" },
            ].map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] bg-secondary sm:mx-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-secondary/50 py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Shop by Category</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`}>
                    <div className="card-cozy group flex flex-col items-center gap-3 rounded-[20px] bg-white p-5 text-center shadow-cozy">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{cat.name}</span>
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
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Freshly Added</h2>
                <p className="mt-1 text-sm text-muted-foreground">The latest from our local shops</p>
              </div>
              <Link to="/products" className="text-sm font-medium text-primary hover:text-purple-600">
                View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} showShop />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[24px]" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="bg-secondary/30 py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Meet Our Shops</h2>
                <p className="mt-1 text-sm text-muted-foreground">Local favorites worth discovering</p>
              </div>
              <Link to="/shops" className="text-sm font-medium text-primary hover:text-purple-600">
                View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {shops.slice(0, 6).map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — light warm card, not dark gradient */}
      {!session && (
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="rounded-[28px] bg-secondary/60 px-8 py-14 text-center sm:px-14 sm:py-16">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to share your creations?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Open your shop on Sugbu Shop Hub and connect with customers across Cebu. It&apos;s free to get started.
              </p>
              <Link to="/register">
                <Button size="lg" className="mt-8 rounded-full px-8 shadow-sm hover:-translate-y-0.5 hover:shadow-md">
                  Create Your Shop <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
