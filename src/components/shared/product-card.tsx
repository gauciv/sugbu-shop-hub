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
    <Link to={`/product/${product.id}`} className="block h-full">
      <Card className="card-cozy group flex h-full flex-col overflow-hidden rounded-xl border-border/60 transition-all duration-200 hover:border-pink-200">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-purple-50">
          {product.image_urls[0] ? (
            <img
              src={product.image_urls[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-purple-300" />
            </div>
          )}
          {onSale && (
            <Badge className="absolute left-1.5 top-1.5 rounded-full bg-accent text-[10px] text-white border-0 px-2 py-0">
              Sale
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Badge variant="secondary" className="text-xs text-muted-foreground">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col p-3">
          {showShop && product.shop && (
            <p className="mb-0.5 truncate text-[10px] font-medium uppercase tracking-wider text-primary">
              {product.shop.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground sm:text-sm">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold tabular-nums text-foreground">
                {formatPrice(product.price)}
              </span>
              {onSale && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 shrink-0 rounded-full transition-all duration-200",
                justAdded
                  ? "bg-emerald-50 text-emerald-600 scale-110"
                  : "text-purple-400 hover:bg-pink-50 hover:text-pink-500"
              )}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {justAdded ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
