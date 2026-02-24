import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ShopCard } from "@/components/shared/shop-card";
import { getActiveShops } from "@/api/shops";
import { getFeaturedProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/context/auth";
import { ArrowRight, Store, ShoppingBag, Heart, Sparkles, Shirt, Home as HomeIcon, Smartphone, Palette, UtensilsCrossed, MapPin } from "lucide-react";
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
      {/* Hero — bold, warm, asymmetric, layered */}
      <section className="relative overflow-hidden bg-grain pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-32">
        {/* Layered decorative blobs — vivid, confident */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-pink-300/25 blur-[80px]" />
        <div className="pointer-events-none absolute left-1/3 top-20 h-[300px] w-[300px] rounded-full bg-purple-200/20 blur-[60px]" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Text content — left, slightly offset */}
            <div className="text-center lg:text-left animate-fade-in-up">
              {/* Floating badge */}
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
                <MapPin className="h-3.5 w-3.5" />
                Supporting Cebu&apos;s small businesses
              </span>

              <h1 className="font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                Your cozy corner{" "}
                <br className="hidden sm:block" />
                for <span className="text-gradient">local finds</span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
                Discover handpicked goodies from Cebu&apos;s favorite small businesses — artisan treats, local crafts, and everyday finds.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/shops">
                  <Button size="lg" className="rounded-full px-8 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
                    Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="rounded-full border-purple-300 bg-white px-8 text-purple-700 shadow-sm hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-md">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero image area — rounded, layered depth, with floating accents */}
            <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              {/* Decorative blobs behind image */}
              <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-pink-200/40 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-purple-200/50 blur-2xl" />

              <div className="relative mx-auto aspect-[4/3] max-w-lg">
                <div className="bg-grain h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-8 shadow-cozy-lg">
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary shadow-cozy">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-display text-lg text-foreground/70">Your hero image goes here</p>
                    <p className="text-sm text-muted-foreground">Upload a cozy image to personalize this space</p>
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div className="animate-float absolute -right-4 top-6 rounded-2xl bg-white px-4 py-2.5 shadow-cozy-lg">
                  <span className="flex items-center gap-2 text-xs font-bold text-purple-700">
                    <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" /> Handmade &amp; Local
                  </span>
                </div>

                {/* Floating badge — bottom left */}
                <div className="animate-float-slow absolute -left-4 bottom-10 rounded-2xl bg-primary px-4 py-2.5 shadow-cozy-lg">
                  <span className="flex items-center gap-2 text-xs font-bold text-white">
                    <Store className="h-3.5 w-3.5" /> 50+ Local Shops
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props — bold icon cards with layered backgrounds */}
      <section className="relative py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {[
              { icon: Store, title: "Local Shops", desc: "Curated businesses from all around Cebu, handpicked with care", color: "bg-purple-100 text-purple-700" },
              { icon: Heart, title: "Trusted Sellers", desc: "Every merchant is verified so you can shop with confidence", color: "bg-pink-100 text-pink-600" },
              { icon: ShoppingBag, title: "Easy Shopping", desc: "A simple, cozy experience from browsing to doorstep delivery", color: "bg-purple-100 text-purple-700" },
            ].map((item) => (
              <div key={item.title} className="bg-grain rounded-[24px] bg-white p-6 shadow-cozy">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-display text-lg text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — bold cards */}
      {categories.length > 0 && (
        <section className="bg-grain relative bg-secondary py-16">
          <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Shop by Category</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`}>
                    <div className="card-cozy group flex flex-col items-center gap-3 rounded-[20px] bg-white p-5 text-center shadow-cozy">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-purple-100 text-purple-600 transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{cat.name}</span>
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
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Freshly Added</h2>
                <p className="mt-1 text-sm text-muted-foreground">The latest from our local shops</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary hover:text-purple-700">
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
        <section className="bg-grain relative bg-secondary/60 py-16">
          <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Meet Our Shops</h2>
                <p className="mt-1 text-sm text-muted-foreground">Local favorites worth discovering</p>
              </div>
              <Link to="/shops" className="text-sm font-bold text-primary hover:text-purple-700">
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

      {/* CTA — bold, confident, warm */}
      {!session && (
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="bg-grain relative overflow-hidden rounded-[28px] bg-gradient-to-br from-purple-600 to-purple-800 px-8 py-14 text-center sm:px-14 sm:py-16">
              {/* Decorative accent blobs */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-400/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-400/30 blur-2xl" />

              <div className="relative">
                <h2 className="font-display text-2xl tracking-tight text-white sm:text-3xl">
                  Ready to share your creations?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-purple-200">
                  Open your shop on Sugbu Shop Hub and connect with customers across Cebu. It&apos;s free to get started.
                </p>
                <Link to="/register">
                  <Button size="lg" className="mt-8 rounded-full bg-white px-8 text-purple-700 shadow-cozy-lg hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-lg">
                    Create Your Shop <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
