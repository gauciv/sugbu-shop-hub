import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ShopCard } from "@/components/shared/shop-card";
import { getActiveShops } from "@/api/shops";
import { getFeaturedProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/context/auth";
import { ArrowRight, Store, ShoppingBag, Shield, Sparkles, Shirt, Home as HomeIcon, Smartphone, Palette, UtensilsCrossed, Heart } from "lucide-react";
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

function WaveDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[40px] w-full sm:h-[60px]">
        <path
          d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
          className="fill-current"
        />
      </svg>
    </div>
  );
}

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
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-purple-200/25 blur-3xl animate-float" />
        <div className="pointer-events-none absolute right-1/3 top-1/4 h-40 w-40 rounded-full bg-pink-300/15 blur-2xl animate-float-slow" style={{ animationDelay: "2s" }} />

        {/* Small decorative dots */}
        <div className="pointer-events-none absolute left-[10%] top-[20%] h-3 w-3 rounded-full bg-purple-300/40 animate-float" style={{ animationDelay: "0s" }} />
        <div className="pointer-events-none absolute left-[80%] top-[30%] h-2 w-2 rounded-full bg-pink-300/50 animate-float" style={{ animationDelay: "1s" }} />
        <div className="pointer-events-none absolute left-[60%] top-[70%] h-4 w-4 rounded-full bg-purple-200/40 animate-float-slow" style={{ animationDelay: "3s" }} />
        <div className="pointer-events-none absolute left-[25%] top-[65%] h-2.5 w-2.5 rounded-full bg-pink-200/50 animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/70 px-4 py-1.5 text-xs font-medium text-purple-500 shadow-sm backdrop-blur-sm">
                <Heart className="h-3 w-3 fill-pink-300 text-pink-300" /> Supporting Cebu&apos;s small businesses
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Your cozy corner for{" "}
                <span className="text-gradient">
                  local finds
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                Discover handpicked goodies from Cebu&apos;s favorite small businesses. Artisan treats, local crafts, and everyday finds — all in one warm little corner.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/shops">
                  <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-7 text-white shadow-lg shadow-purple-400/20 hover:from-purple-500 hover:to-pink-500 hover:shadow-xl hover:shadow-purple-400/25">
                    Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="rounded-full border-purple-200 bg-white/60 px-7 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right — Hero image area */}
            <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative mx-auto aspect-square max-w-md">
                {/* Warm gradient placeholder with floating shapes */}
                <div className="h-full w-full overflow-hidden rounded-3xl border border-purple-100/60 bg-gradient-to-br from-purple-100 via-pink-50 to-lavender-100 p-8 shadow-cozy-lg">
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-cozy animate-float-slow">
                      <Store className="h-10 w-10 text-purple-400" />
                    </div>
                    <p className="text-lg font-semibold text-purple-500/80">Sugbu Shop Hub</p>
                    <p className="text-sm text-muted-foreground">Upload your hero image to personalize this space</p>
                  </div>
                </div>
                {/* Floating accent shapes */}
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-2xl bg-pink-200/60 shadow-sm animate-float" style={{ animationDelay: "1s" }} />
                <div className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-purple-200/60 shadow-sm animate-float-slow" style={{ animationDelay: "0.5s" }} />
                <div className="absolute -right-2 bottom-1/4 h-8 w-8 rounded-lg bg-pink-300/40 animate-float" style={{ animationDelay: "2s" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Wavy bottom edge */}
        <WaveDivider className="text-white" />
      </section>

      {/* Value Props */}
      <section className="relative bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {[
              { icon: Store, title: "Local Shops", desc: "Curated businesses from all around Cebu, handpicked just for you", color: "bg-purple-50", iconColor: "text-purple-400" },
              { icon: Shield, title: "Trusted Sellers", desc: "Every merchant is verified so you can shop with confidence", color: "bg-pink-50", iconColor: "text-pink-400" },
              { icon: ShoppingBag, title: "Easy Shopping", desc: "A simple, cozy checkout experience from browse to doorstep", color: "bg-lavender-100", iconColor: "text-purple-400" },
            ].map((item) => (
              <div key={item.title} className="card-cozy flex items-start gap-4 rounded-2xl border border-border/40 bg-white p-5 shadow-cozy">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-lavender-50/50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`}>
                    <div className="card-cozy group flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-white p-5 text-center shadow-cozy">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-purple-50 text-purple-400 transition-colors group-hover:from-purple-100 group-hover:to-pink-50">
                        <Icon className="h-6 w-6" />
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
        <section className="relative bg-white py-14">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Freshly Added Goodies</h2>
                <p className="mt-1 text-sm text-muted-foreground">The latest from our lovely local shops</p>
              </div>
              <Link to="/products">
                <Button variant="ghost" size="sm" className="rounded-full text-purple-400 hover:bg-purple-50 hover:text-purple-500">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
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
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wave divider */}
      {!loading && shops.length > 0 && (
        <WaveDivider className="text-lavender-50/60" />
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="bg-lavender-50/60 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Meet Our Lovely Shops</h2>
                <p className="mt-1 text-sm text-muted-foreground">Local favorites you&apos;ll keep coming back to</p>
              </div>
              <Link to="/shops">
                <Button variant="ghost" size="sm" className="rounded-full text-purple-400 hover:bg-purple-50 hover:text-purple-500">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shops.slice(0, 6).map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - only show for non-authenticated users */}
      {!session && (
        <section className="relative overflow-hidden py-16">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-400 via-purple-500 to-pink-400 px-8 py-14 text-center shadow-cozy-lg sm:px-12 sm:py-16">
              {/* Decorative shapes */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-400/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />
              <div className="pointer-events-none absolute right-1/4 top-1/3 h-4 w-4 rounded-full bg-white/20 animate-float" />
              <div className="pointer-events-none absolute left-1/4 bottom-1/3 h-3 w-3 rounded-full bg-white/15 animate-float-slow" />

              <div className="relative">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to open your own little shop?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-purple-100">
                  Join Sugbu Shop Hub and share your creations with customers across Cebu. It&apos;s free to get started.
                </p>
                <Link to="/register">
                  <Button size="lg" className="mt-8 rounded-full bg-white px-8 text-purple-500 shadow-lg hover:bg-purple-50 hover:shadow-xl">
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
