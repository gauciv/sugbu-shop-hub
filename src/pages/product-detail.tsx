import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { StarRating } from "@/components/shared/star-rating";
import { RatingBreakdown } from "@/components/shared/rating-breakdown";
import { ReviewCard } from "@/components/shared/review-card";
import { ReviewImageGallery } from "@/components/shared/review-image-gallery";
import { getProductById } from "@/api/products";
import { getProductReviews, getReviewStats } from "@/api/reviews";
import { getOrCreateConversation } from "@/api/messages";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/auth";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Store, Check, ImageOff, ArrowLeft, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Product, Review, ReviewStats } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  // Review state
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const REVIEWS_PAGE_SIZE = 5;

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  // Load review stats
  useEffect(() => {
    if (!product) return;
    getReviewStats(product.id).then(setReviewStats).catch(() => {});
  }, [product]);

  // Load paginated reviews
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    getProductReviews(product.id, {
      page: reviewsPage,
      pageSize: REVIEWS_PAGE_SIZE,
      rating: ratingFilter ?? undefined,
    })
      .then(({ reviews: r, count: c }) => {
        setReviews(r);
        setReviewsCount(c);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [product, reviewsPage, ratingFilter]);

  function handleAddToCart() {
    if (!product || product.stock <= 0 || justAdded) return;
    if (!session) {
      toast("Sign up to start shopping!", {
        description: "Create an account to add items to your cart.",
        action: { label: "Sign up", onClick: () => navigate("/register") },
      });
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_urls[0] ?? "",
      shopId: product.shop_id,
      shopName: product.shop?.name ?? "",
      stock: product.stock,
    }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  async function handleChat() {
    if (!profile || !product?.shop) return;
    setStartingChat(true);
    try {
      const conv = await getOrCreateConversation(
        profile.id,
        product.shop.id,
        product.shop.owner_id,
        product.id
      );
      navigate(`/messages?conv=${conv.id}`);
    } catch {
      toast.error("Couldn't start conversation");
    } finally {
      setStartingChat(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">Product not found</h2>
          <Link to="/shops">
            <Button className="mt-4" variant="outline">Browse Shops</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={product.shop ? `/shop/${product.shop.slug}` : "/shops"}>
        <Button variant="ghost" size="sm" className="mb-6 rounded-full text-muted-foreground hover:bg-pink-50 hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {product.shop ? `Back to ${product.shop.name}` : "Back to Shops"}
        </Button>
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-[32px] border border-border/40 bg-secondary/40 shadow-cozy sm:rounded-[36px]">
            {product.image_urls[selectedImage] ? (
              <img
                src={product.image_urls[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-purple-200" />
              </div>
            )}
          </div>
          {product.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.image_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-16 sm:w-16 sm:rounded-2xl ${
                    i === selectedImage ? "border-primary shadow-cozy" : "border-border/60 hover:border-pink-200"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-2">
          {product.shop && (
            <Link to={`/shop/${product.shop.slug}`} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-500 hover:bg-pink-100">
              <Store className="h-3.5 w-3.5" /> {product.shop.name}
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

          {product.review_count !== undefined && product.review_count > 0 && (
            <div className="mt-2">
              <StarRating
                rating={product.avg_rating ?? 0}
                showValue
                count={product.review_count}
              />
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
            {onSale && (
              <Badge className="bg-accent text-white border-0">
                {Math.round((1 - product.price / product.compare_at_price!) * 100)}% OFF
              </Badge>
            )}
          </div>

          {product.category && (
            <Badge variant="secondary" className="mt-3 rounded-full">
              {product.category.name}
            </Badge>
          )}

          <Separator className="my-6" />

          {product.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <div className="rounded-[28px] bg-pink-50/70 p-5 shadow-cozy">
              <div className="mb-4 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">{product.stock} in stock</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <QuantitySelector value={quantity} max={product.stock} onChange={setQuantity} />
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={justAdded}
                className={
                  justAdded
                    ? "mt-4 w-full rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "mt-4 w-full rounded-full shadow-cozy transition-all hover:-translate-y-0.5 hover:shadow-cozy-lg"
                }
              >
                {justAdded ? (
                  <><Check className="mr-2 h-5 w-5" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>
                )}
              </Button>
            </div>
          )}

          {product.stock <= 0 && (
            <div className="rounded-[28px] bg-pink-50/70 p-5 shadow-cozy">
              <span className="text-destructive font-medium">Out of stock</span>
            </div>
          )}

          {/* Chat with Seller */}
          {profile?.role === "buyer" && product.shop && profile.id !== product.shop.owner_id && (
            <Button
              variant="outline"
              className="mt-3 w-full rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
              onClick={handleChat}
              disabled={startingChat}
            >
              {startingChat ? (
                <><span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-pink-400 border-t-transparent rounded-full" /> Starting chat...</>
              ) : (
                <><MessageSquare className="mr-2 h-4 w-4" /> Chat with Seller</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviewStats && reviewStats.review_count > 0 && (
        <div className="mt-10">
          <Separator className="mb-8" />
          <h2 className="mb-6 font-display text-xl font-bold tracking-tight">
            Product Reviews
          </h2>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Left: Rating breakdown */}
            <div className="rounded-[28px] border border-border/60 bg-card p-5 shadow-cozy lg:sticky lg:top-24 lg:self-start">
              <RatingBreakdown
                stats={reviewStats}
                selectedRating={ratingFilter}
                onRatingFilter={(r) => { setRatingFilter(r); setReviewsPage(1); }}
              />
            </div>

            {/* Right: Reviews list */}
            <div>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No reviews match this filter.
                </p>
              ) : (
                <div className="divide-y divide-border/40">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onImageClick={(urls, index) => {
                        setGalleryImages(urls);
                        setGalleryIndex(index);
                        setGalleryOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {Math.ceil(reviewsCount / REVIEWS_PAGE_SIZE) > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewsPage <= 1}
                    onClick={() => setReviewsPage((p) => p - 1)}
                    className="rounded-full border-border/60"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="px-4 text-sm tabular-nums text-muted-foreground">
                    Page {reviewsPage} of {Math.ceil(reviewsCount / REVIEWS_PAGE_SIZE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewsPage >= Math.ceil(reviewsCount / REVIEWS_PAGE_SIZE)}
                    onClick={() => setReviewsPage((p) => p + 1)}
                    className="rounded-full border-border/60"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <ReviewImageGallery
            images={galleryImages}
            initialIndex={galleryIndex}
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
          />
        </div>
      )}
    </div>
  );
}
