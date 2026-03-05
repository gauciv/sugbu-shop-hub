import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { createOrUpdateReview } from "@/api/reviews";
import { uploadReviewImage } from "@/api/storage";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/types";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productImage: string | null;
  buyerId: string;
  orderItemId: string;
  existingReview?: Review | null;
  onSuccess: (review: Review) => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productImage,
  buyerId,
  orderItemId,
  existingReview,
  onSuccess,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(existingReview?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!existingReview;

  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating ?? 0);
      setComment(existingReview?.comment ?? "");
      setImageUrls(existingReview?.image_urls ?? []);
    }
  }, [open, existingReview]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (imageUrls.length + files.length > 3) {
      toast.error("Maximum 3 images per review");
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadReviewImage));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const review = await createOrUpdateReview({
        productId,
        buyerId,
        orderItemId,
        rating,
        comment: comment.trim() || undefined,
        imageUrls,
      });
      toast.success(isEdit ? "Review updated!" : "Review submitted!");
      onSuccess(review);
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-border/60 shadow-dreamy sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Review" : "Write a Review"}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-2 flex items-center gap-3">
              {productImage && (
                <img src={productImage} alt="" className="h-10 w-10 rounded-xl object-cover" />
              )}
              <span className="truncate font-medium text-foreground">{productName}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <StarRatingInput value={rating} onChange={setRating} />

          <Textarea
            placeholder="Share your experience with this product... (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-24 rounded-2xl"
            maxLength={1000}
          />

          <div>
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative h-16 w-16">
                  <img src={url} alt="" className="h-full w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {imageUrls.length < 3 && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-pink-200 hover:bg-pink-50/50">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Up to 3 images ({imageUrls.length}/3)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting || uploading}
            className="w-full rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg sm:w-auto"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
