import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { ReviewCard } from "@/components/shared/review-card";
import { ReviewImageGallery } from "@/components/shared/review-image-gallery";
import { EmptyState } from "@/components/shared/empty-state";
import { getShopBySlug } from "@/api/shops";
import { getActiveShopProducts } from "@/api/products";
import { getTopRatedProducts, getShopReviews } from "@/api/reviews";
import { getOrCreateConversation } from "@/api/messages";
import { useAuth } from "@/context/auth";
import { getInitials, formatPrice } from "@/lib/utils";
import { Package, MapPin, Mail, Phone, Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Shop, Product, Review } from "@/types";

export default function ShopDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [startingChat, setStartingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topRated, setTopRated] = useState<{ id: string; name: string; image_urls: string[]; price: number; avg_rating: number; review_count: number }[]>([]);
  const [shopReviews, setShopReviews] = useState<Review[]>([]);
  const [shopReviewsCount, setShopReviewsCount] = useState(0);
  const [shopReviewsPage, setShopReviewsPage] = useState(1);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const REVIEWS_PAGE_SIZE = 5;

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const s = await getShopBySlug(slug);
        setShop(s);
        const p = await getActiveShopProducts(s.id);
        setProducts(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Fetch top rated products
  useEffect(() => {
    if (!shop) return;
    getTopRatedProducts(shop.id, 4).then(setTopRated).catch(() => {});
  }, [shop?.id]);

  // Fetch paginated shop reviews
  useEffect(() => {
    if (!shop) return;
    getShopReviews(shop.id, { page: shopReviewsPage, pageSize: REVIEWS_PAGE_SIZE })
      .then(({ reviews, count }) => {
        setShopReviews(reviews);
        setShopReviewsCount(count);
      })
      .catch(() => {});
  }, [shop?.id, shopReviewsPage]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-48 w-full" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return <EmptyState icon={Package} title="Shop not found" description="This shop doesn't exist or has been deactivated." />;
  }

  async function handleChat() {
    if (!profile || !shop) return;
    setStartingChat(true);
    try {
      const conv = await getOrCreateConversation(
        profile.id,
        shop.id,
        shop.owner_id
      );
      navigate(`/messages?conv=${conv.id}`);
    } catch {
      toast.error("Couldn't start conversation");
    } finally {
      setStartingChat(false);
    }
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-pink-50 via-purple-50 to-lavender-100 sm:h-56 lg:h-64">
        {shop.banner_url && (
          <img
            src={shop.banner_url}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `center ${shop.banner_position_y ?? 50}%` }}
          />
        )}
      </div>

      {/* Shop Info — Facebook-style: avatar overlaps banner, name below */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center pb-6 sm:flex-row sm:items-end sm:gap-5">
          <Avatar className="-mt-12 h-24 w-24 shrink-0 border-4 border-white shadow-lg sm:-mt-14 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <AvatarImage src={shop.logo_url ?? undefined} className="object-cover" />
            <AvatarFallback className="bg-purple-50 text-2xl font-bold text-purple-400 sm:text-3xl">
              {getInitials(shop.name)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-3 text-center sm:mt-0 sm:pb-1 sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{shop.name}</h1>
            {shop.description && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{shop.description}</p>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
              {shop.address && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.address}</span>
              )}
              {shop.contact_email && (
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {shop.contact_email}</span>
              )}
              {shop.contact_phone && (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {shop.contact_phone}</span>
              )}
            </div>
            {profile?.role === "buyer" && profile.id !== shop.owner_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleChat}
                disabled={startingChat}
                className="mt-3 rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                {startingChat ? "Starting chat…" : "Chat with Seller"}
              </Button>
            )}
          </div>
        </div>

        {/* Top Rated Products */}
        {topRated.length > 0 && (
          <div className="border-t border-border/60 py-8">
            <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              Top Rated
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {topRated.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="block">
                  <div className="group overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-cozy transition-all hover:border-pink-200 hover:shadow-cozy-lg">
                    <div className="aspect-[4/3] overflow-hidden bg-purple-50">
                      {p.image_urls[0] ? (
                        <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-purple-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-semibold">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium tabular-nums">{p.avg_rating.toFixed(1)}</span>
                        <span className="text-[11px] text-muted-foreground">({p.review_count})</span>
                      </div>
                      <p className="mt-1 text-sm font-bold">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="border-t border-border/60 py-8">
          <h2 className="mb-6 font-display text-lg font-semibold">Products ({products.length})</h2>
          {products.length === 0 ? (
            <EmptyState icon={Package} title="No products" description="This shop hasn't added any products yet." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        {shopReviewsCount > 0 && (
          <div className="border-t border-border/60 py-8">
            <h2 className="mb-6 font-display text-lg font-semibold">
              Customer Reviews ({shopReviewsCount})
            </h2>
            <div className="divide-y divide-border/40">
              {shopReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showProduct
                  onImageClick={(urls, index) => {
                    setGalleryImages(urls);
                    setGalleryIndex(index);
                    setGalleryOpen(true);
                  }}
                />
              ))}
            </div>

            {Math.ceil(shopReviewsCount / REVIEWS_PAGE_SIZE) > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={shopReviewsPage <= 1}
                  onClick={() => setShopReviewsPage((p) => p - 1)}
                  className="rounded-full border-border/60"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="px-4 text-sm tabular-nums text-muted-foreground">
                  Page {shopReviewsPage} of {Math.ceil(shopReviewsCount / REVIEWS_PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={shopReviewsPage >= Math.ceil(shopReviewsCount / REVIEWS_PAGE_SIZE)}
                  onClick={() => setShopReviewsPage((p) => p + 1)}
                  className="rounded-full border-border/60"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            <ReviewImageGallery
              images={galleryImages}
              initialIndex={galleryIndex}
              open={galleryOpen}
              onOpenChange={setGalleryOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}
