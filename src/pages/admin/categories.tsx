import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount,
} from "@/api/categories";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, Tag } from "lucide-react";
import type { Category } from "@/types";

interface CategoryFormData {
  name: string;
  icon: string;
  display_order: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<CategoryFormData>();

  const watchedName = watch("name", "");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditTarget(null);
    reset({ name: "", icon: "", display_order: categories.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    reset({ name: cat.name, icon: cat.icon ?? "", display_order: cat.display_order });
    setDialogOpen(true);
  }

  async function onSubmit(data: CategoryFormData) {
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateCategory(editTarget.id, {
          name: data.name,
          slug: slugify(data.name),
          icon: data.icon || null,
          display_order: Number(data.display_order),
        });
        setCategories((prev) =>
          prev
            .map((c) => (c.id === editTarget.id ? updated : c))
            .sort((a, b) => a.display_order - b.display_order)
        );
        toast.success("Category updated");
      } else {
        const created = await createCategory({
          name: data.name,
          slug: slugify(data.name),
          icon: data.icon || null,
          display_order: Number(data.display_order),
        });
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.display_order - b.display_order)
        );
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg.includes("unique") ? "A category with this name already exists." : msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    const count = await getCategoryProductCount(cat.id).catch(() => 0);
    const confirmMsg =
      count > 0
        ? `"${cat.name}" has ${count} product${count !== 1 ? "s" : ""}. Those products will become uncategorized. Delete anyway?`
        : `Delete category "${cat.name}"?`;
    if (!confirm(confirmMsg)) return;

    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const sorted = [...categories];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[swapIndex];
    const aOrder = a.display_order;
    const bOrder = b.display_order;

    // Swap display_order values optimistically
    sorted[index] = { ...a, display_order: bOrder };
    sorted[swapIndex] = { ...b, display_order: aOrder };
    sorted.sort((x, y) => x.display_order - y.display_order);
    setCategories(sorted);

    try {
      await Promise.all([
        updateCategory(a.id, { display_order: bOrder }),
        updateCategory(b.id, { display_order: aOrder }),
      ]);
    } catch {
      toast.error("Failed to reorder");
      // Revert on failure
      getCategories().then(setCategories);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card className="border-border/60">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border/40 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground rounded-t-xl">
          <div className="w-8 text-center">#</div>
          <div>Category</div>
          <div className="w-20 text-center">Icon</div>
          <div className="w-20 text-center">Reorder</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Tag className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            </div>
          ) : (
            categories.map((cat, i) => (
              <div
                key={cat.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50/70 ${
                  i < categories.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                {/* Order number */}
                <div className="w-8 text-center text-sm font-bold text-muted-foreground">
                  {cat.display_order}
                </div>

                {/* Name + slug */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.slug}</p>
                </div>

                {/* Icon name */}
                <div className="w-20 text-center">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {cat.icon ?? "—"}
                  </span>
                </div>

                {/* Reorder arrows */}
                <div className="flex w-20 items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === 0}
                    onClick={() => handleReorder(i, "up")}
                    className="h-7 w-7 text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === categories.length - 1}
                    onClick={() => handleReorder(i, "down")}
                    className="h-7 w-7 text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Edit / Delete */}
                <div className="flex w-20 items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(cat)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === cat.id}
                    onClick={() => handleDelete(cat)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Electronics"
                className="border-border/60"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
              {watchedName && (
                <p className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono">{slugify(watchedName)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Icon{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Lucide icon name)
                </span>
              </Label>
              <Input
                {...register("icon")}
                placeholder="e.g. Smartphone"
                className="border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                min={1}
                {...register("display_order", { required: true, valueAsNumber: true })}
                className="border-border/60"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-border/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editTarget ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
