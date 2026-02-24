import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ImageOff, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showShop?: boolean;
}

export function ProductCard({ product, showShop }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0 || justAdded) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_urls[0] ?? "",
      shopId: product.shop_id,
      shopName: product.shop?.name ?? "",
      stock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="card-cozy group overflow-hidden rounded-2xl border-border/60 transition-all duration-200 hover:border-border">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-lavender-100/50">
          {product.image_urls[0] ? (
            <img
              src={product.image_urls[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className="h-10 w-10 text-purple-200" />
            </div>
          )}
          {onSale && (
            <Badge className="absolute left-2 top-2 rounded-full bg-accent text-white">
              Sale
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Badge variant="secondary" className="text-muted-foreground">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {showShop && product.shop && (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.shop.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tabular-nums text-foreground">
                {formatPrice(product.price)}
              </span>
              {onSale && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                justAdded
                  ? "bg-emerald-50 text-emerald-600 scale-110"
                  : "text-purple-400 hover:bg-purple-50 hover:text-purple-500"
              )}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {justAdded ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
