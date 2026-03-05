import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ShopCard } from "@/components/shared/shop-card";
import { DoodleHeart, DoodleStar, DoodleSparkle, DoodleLeaf, DoodleShoppingBag, DoodleFlower } from "@/components/shared/doodles";
import { getActiveShops } from "@/api/shops";
import { getFeaturedProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/context/auth";
import { ArrowRight, ShoppingBag, Heart, Sparkles, Shirt, Home as HomeIcon, Smartphone, Palette, UtensilsCrossed, Store } from "lucide-react";
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
      {/* Hero — scrapbooked, intimate, soft girl aesthetic */}
      <section className="relative overflow-hidden pb-8 pt-6 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-14">
        {/* Soft pastel background blobs — organic shapes */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] blob bg-purple-200/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] blob bg-pink-200/30 blur-[100px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[200px] w-[200px] blob bg-pink-100/25 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              {/* Handwritten accent label */}
              <span className="mb-3 inline-block font-accent text-xl text-accent rotate-[-2deg] sm:text-2xl">
                ~ handpicked with love ~
              </span>

              <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                Your cozy corner{" "}
                <br className="hidden sm:block" />
                for <span className="text-gradient">local finds</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
                Discover handpicked goodies from Cebu&apos;s favorite small businesses — artisan treats, local crafts, and everyday finds.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/shops">
                  <Button size="lg" className="rounded-full px-8 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
                    Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="rounded-full border-pink-200 bg-card px-8 text-pink-500 shadow-sm hover:-translate-y-0.5 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero image area — organic shape with scrapbook decorations */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              {/* Floating doodle illustrations — hidden on mobile */}
              <DoodleHeart className="absolute -left-6 top-4 hidden h-8 w-8 text-pink-300 animate-float lg:block" />
              <DoodleStar className="absolute -right-2 top-0 hidden h-7 w-7 text-purple-300 animate-float lg:block" style={{ animationDelay: "1s" }} />
              <DoodleSparkle className="absolute -left-4 bottom-16 hidden h-6 w-6 text-purple-400 animate-float lg:block" style={{ animationDelay: "2s" }} />
              <DoodleLeaf className="absolute -right-4 bottom-8 hidden h-7 w-7 text-pink-300 animate-float lg:block" style={{ animationDelay: "1.5s" }} />
              <DoodleFlower className="absolute left-8 -top-6 hidden h-8 w-8 text-purple-300 animate-float lg:block" style={{ animationDelay: "0.5s" }} />

              <div className="relative mx-auto max-w-[280px] sm:max-w-xs lg:max-w-md">
                {/* Washi tape decorations */}
                <div className="tape-strip -top-2 left-6 z-10" />
                <div className="tape-strip -bottom-1 right-8 z-10" style={{ transform: "rotate(8deg)" }} />

                <div className="overflow-hidden rounded-[32px] border-2 border-pink-200 shadow-dreamy rotate-[1.5deg] sm:rounded-[40px]">
                  <img
                    src="/assets/hero-image.jpg"
                    alt="A cozy local market stall with colorful handmade goods"
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props — soft pastel cards with scrapbook tilt */}
      <section className="relative py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: Store, doodle: DoodleShoppingBag, title: "Local Shops", desc: "Curated businesses from all around Cebu, handpicked with care", border: "border-purple-200", rotate: "-rotate-1" },
              { icon: Heart, doodle: DoodleHeart, title: "Trusted Sellers", desc: "Every merchant is verified so you can shop with confidence", border: "border-pink-200", rotate: "rotate-[0.5deg]" },
              { icon: ShoppingBag, doodle: DoodleStar, title: "Easy Shopping", desc: "A simple, cozy experience from browsing to doorstep delivery", border: "border-purple-200", rotate: "rotate-1" },
            ].map((item) => (
              <div key={item.title} className={`${item.rotate} rounded-[28px] border-2 ${item.border} bg-card p-4 shadow-cozy sm:rounded-[32px] sm:p-5`}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary sm:mb-3 sm:h-12 sm:w-12">
                  <item.doodle className="h-6 w-6 text-purple-400 sm:h-7 sm:w-7" />
                </div>
                <p className="font-display text-base font-semibold text-foreground lg:text-lg">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — soft rounded cards */}
      {categories.length > 0 && (
        <section className="bg-secondary/60 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="mb-6 text-center">
              <span className="font-accent text-lg text-accent">~ browse by type ~</span>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Shop by Category</h2>
              <p className="mt-1.5 text-sm text-muted-foreground lg:text-base">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`} className="block h-full">
                    <div className="card-cozy group flex h-full flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-purple-100 bg-card p-4 text-center shadow-cozy">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-400 transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="line-clamp-2 text-sm font-bold leading-tight text-foreground">{cat.name}</span>
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
        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="mb-5 flex items-end justify-between sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <DoodleSparkle className="h-5 w-5 text-purple-300 sm:h-6 sm:w-6" />
                <div>
                  <span className="font-accent text-base text-accent sm:text-lg">~ freshly added ~</span>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-3xl">New Arrivals</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">The latest from our local shops</p>
                </div>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary hover:text-purple-600">
                View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} showShop />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[28px] sm:rounded-[32px]" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="bg-secondary/50 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="mb-5 flex items-end justify-between sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <DoodleHeart className="h-5 w-5 text-pink-300 sm:h-6 sm:w-6" />
                <div>
                  <span className="font-accent text-base text-accent sm:text-lg">~ lovely locals ~</span>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-3xl">Meet Our Shops</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Local favorites worth discovering</p>
                </div>
              </div>
              <Link to="/shops" className="text-sm font-bold text-primary hover:text-purple-600">
                View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {shops.slice(0, 6).map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — warm, inviting, scrapbooked */}
      {!session && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-8">
            <div className="relative overflow-hidden rounded-[36px] border-2 border-purple-200 bg-gradient-to-br from-purple-100/80 via-pink-50 to-purple-50 px-6 py-8 text-center shadow-dreamy rotate-[-0.5deg] sm:px-14 sm:py-10">
              {/* Doodle decorations */}
              <DoodleStar className="absolute left-6 top-6 h-8 w-8 text-purple-200 animate-float" />
              <DoodleHeart className="absolute bottom-6 right-6 h-7 w-7 text-pink-200 animate-float" style={{ animationDelay: "1.5s" }} />
              <DoodleFlower className="absolute right-12 top-4 h-7 w-7 text-purple-200 animate-float" style={{ animationDelay: "0.8s" }} />

              <div className="relative">
                <span className="font-accent text-xl text-accent">~ join our little corner ~</span>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Ready to share your creations?
                </h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Open your shop on Sugbu Shop Hub and connect with customers across Cebu. It&apos;s free to get started.
                </p>
                <Link to="/register">
                  <Button size="lg" className="mt-5 rounded-full px-8 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
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
