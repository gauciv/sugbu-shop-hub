import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

const STAR_LABELS = ["Terrible", "Poor", "Average", "Good", "Excellent"];

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="rounded-full p-0.5 transition-transform hover:scale-110 focus:outline-none"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-xs font-medium text-muted-foreground">
          {STAR_LABELS[(hovered || value) - 1]}
        </span>
      )}
    </div>
  );
}
