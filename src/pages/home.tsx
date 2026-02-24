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
      {/* Hero — cozy, whimsical, hand-drawn feel */}
      <section className="relative overflow-hidden pb-10 pt-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        {/* Soft pastel background blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-purple-100/50 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[350px] w-[350px] rounded-full bg-pink-100/40 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              {/* Static badge — no animation */}
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-xs font-semibold text-pink-500">
                <DoodleHeart className="h-3.5 w-3.5 text-pink-400" />
                Supporting Cebu&apos;s small businesses
              </span>

              <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                Your cozy corner{" "}
                <br className="hidden sm:block" />
                for <span className="text-gradient">local finds</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
                Discover handpicked goodies from Cebu&apos;s favorite small businesses — artisan treats, local crafts, and everyday finds.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/shops">
                  <Button size="lg" className="rounded-full px-8 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
                    Browse Shops <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!session && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="rounded-full border-pink-200 bg-white px-8 text-pink-500 shadow-sm hover:-translate-y-0.5 hover:bg-pink-50 hover:shadow-md">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero image area — organic cloud shape with doodles */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              {/* Doodle illustrations scattered around — hidden on mobile */}
              <DoodleHeart className="absolute -left-6 top-4 hidden h-8 w-8 text-pink-300 lg:block" />
              <DoodleStar className="absolute -right-2 top-0 hidden h-7 w-7 text-purple-300 lg:block" />
              <DoodleSparkle className="absolute -left-4 bottom-16 hidden h-6 w-6 text-purple-400 lg:block" />
              <DoodleLeaf className="absolute -right-4 bottom-8 hidden h-7 w-7 text-pink-300 lg:block" />
              <DoodleFlower className="absolute left-8 -top-6 hidden h-8 w-8 text-purple-300 lg:block" />

              <div className="relative mx-auto max-w-[280px] sm:max-w-xs lg:max-w-sm">
                <div className="overflow-hidden rounded-[24px] border-2 border-pink-200 sm:rounded-[32px]">
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

      {/* Value Props — soft pastel cards with doodle icons */}
      <section className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            {[
              { icon: Store, doodle: DoodleShoppingBag, title: "Local Shops", desc: "Curated businesses from all around Cebu, handpicked with care", border: "border-purple-200" },
              { icon: Heart, doodle: DoodleHeart, title: "Trusted Sellers", desc: "Every merchant is verified so you can shop with confidence", border: "border-pink-200" },
              { icon: ShoppingBag, doodle: DoodleStar, title: "Easy Shopping", desc: "A simple, cozy experience from browsing to doorstep delivery", border: "border-purple-200" },
            ].map((item) => (
              <div key={item.title} className={`rounded-[20px] border-2 ${item.border} bg-white p-4 sm:rounded-[24px] sm:p-6`}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary sm:mb-3 sm:h-12 sm:w-12 sm:rounded-[14px]">
                  <item.doodle className="h-6 w-6 text-purple-400 sm:h-7 sm:w-7" />
                </div>
                <p className="font-display text-base font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — soft rounded cards */}
      {categories.length > 0 && (
        <section className="bg-secondary py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Shop by Category</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon ?? ""] ?? Store;
                return (
                  <Link key={cat.id} to={`/shops?category=${cat.slug}`} className="block h-full">
                    <div className="card-cozy group flex h-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-purple-100 bg-white p-4 text-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-purple-50 text-purple-400 transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="line-clamp-2 text-xs font-bold leading-tight text-foreground">{cat.name}</span>
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
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <DoodleSparkle className="h-5 w-5 text-purple-300 sm:h-6 sm:w-6" />
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-3xl">Freshly Added</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">The latest from our local shops</p>
                </div>
              </div>
              <Link to="/products" className="text-xs font-bold text-primary hover:text-purple-600 sm:text-sm">
                View all <ArrowRight className="ml-1 inline h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} showShop />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-[24px]" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="bg-secondary/70 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <DoodleHeart className="h-5 w-5 text-pink-300 sm:h-6 sm:w-6" />
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground sm:text-3xl">Meet Our Shops</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Local favorites worth discovering</p>
                </div>
              </div>
              <Link to="/shops" className="text-xs font-bold text-primary hover:text-purple-600 sm:text-sm">
                View all <ArrowRight className="ml-1 inline h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {shops.slice(0, 6).map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — warm, inviting card */}
      {!session && (
        <section className="py-10 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-8">
            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 px-6 py-10 text-center sm:rounded-[28px] sm:px-14 sm:py-14">
              {/* Doodle decorations */}
              <DoodleStar className="absolute left-6 top-6 h-8 w-8 text-purple-200" />
              <DoodleHeart className="absolute bottom-6 right-6 h-7 w-7 text-pink-200" />
              <DoodleFlower className="absolute right-12 top-4 h-7 w-7 text-purple-200" />

              <div className="relative">
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Ready to share your creations?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  Open your shop on Sugbu Shop Hub and connect with customers across Cebu. It&apos;s free to get started.
                </p>
                <Link to="/register">
                  <Button size="lg" className="mt-7 rounded-full px-8 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
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
