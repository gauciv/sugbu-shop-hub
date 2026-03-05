import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

export function StarRating({ rating, size = "md", showValue, count }: StarRatingProps) {
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const iconSize = sizeMap[size];
  const textSize = textMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn("font-semibold tabular-nums", textSize)}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={cn("text-muted-foreground", textSize)}>
          ({count})
        </span>
      )}
    </div>
  );
}
