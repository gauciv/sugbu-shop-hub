import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewImageGalleryProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewImageGallery({ images, initialIndex, open, onOpenChange }: ReviewImageGalleryProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[28px] border-border/60 p-2 shadow-dreamy sm:max-w-3xl">
        <div className="relative flex items-center justify-center">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10 h-10 w-10 rounded-full bg-card/80 shadow-sm"
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <img
            src={images[current]}
            alt=""
            className="max-h-[70vh] w-full rounded-2xl object-contain"
          />
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10 h-10 w-10 rounded-full bg-card/80 shadow-sm"
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-purple-400" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
