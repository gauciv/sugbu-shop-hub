import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { getInitials, formatDate } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
  onImageClick?: (urls: string[], index: number) => void;
}

export function ReviewCard({ review, showProduct, onImageClick }: ReviewCardProps) {
  const buyer = review.buyer;
  const product = review.product;

  return (
    <div className="space-y-3 py-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={buyer?.avatar_url ?? undefined} className="object-cover" />
          <AvatarFallback className="bg-purple-50 text-xs font-bold text-purple-400">
            {getInitials(buyer?.full_name ?? "U")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{buyer?.full_name ?? "Anonymous"}</p>
            <span className="text-[11px] text-muted-foreground">{formatDate(review.created_at)}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {showProduct && product?.name && (
        <div className="flex items-center gap-2 rounded-lg bg-pink-50/60 px-2.5 py-1.5">
          {product.image_urls?.[0] && (
            <img src={product.image_urls[0]} alt="" loading="lazy" className="h-8 w-8 rounded-lg object-cover" />
          )}
          <span className="truncate text-xs font-medium text-muted-foreground">{product.name}</span>
        </div>
      )}

      {review.comment && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {review.image_urls.length > 0 && (
        <div className="flex gap-2">
          {review.image_urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => onImageClick?.(review.image_urls, i)}
              className="h-16 w-16 overflow-hidden rounded-xl border border-border/60 transition-all hover:border-pink-200 hover:shadow-cozy sm:h-20 sm:w-20"
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
