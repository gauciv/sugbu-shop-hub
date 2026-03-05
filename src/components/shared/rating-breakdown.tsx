import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStats } from "@/types";

interface RatingBreakdownProps {
  stats: ReviewStats;
  selectedRating?: number | null;
  onRatingFilter?: (rating: number | null) => void;
}

export function RatingBreakdown({ stats, selectedRating, onRatingFilter }: RatingBreakdownProps) {
  const maxCount = Math.max(...stats.distribution, 1);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold tabular-nums text-foreground">
          {stats.avg_rating.toFixed(1)}
        </div>
        <div className="mt-1 flex justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= Math.round(stats.avg_rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {stats.review_count} {stats.review_count === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star - 1];
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isActive = selectedRating === star;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onRatingFilter?.(isActive ? null : star)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors",
                onRatingFilter ? "cursor-pointer hover:bg-pink-50" : "cursor-default",
                isActive && "bg-pink-50"
              )}
            >
              <span className="flex w-4 items-center gap-0.5 font-medium tabular-nums">
                {star}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right tabular-nums text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
