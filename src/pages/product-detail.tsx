import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { getProductById } from "@/api/products";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Store, Check, ImageOff, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!product || product.stock <= 0 || justAdded) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_urls[0] ?? "",
        shopId: product.shop_id,
        shopName: product.shop?.name ?? "",
        stock: product.stock,
      });
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
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
        <Button variant="ghost" size="sm" className="mb-6 rounded-full text-muted-foreground hover:bg-pink-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {product.shop ? `Back to ${product.shop.name}` : "Back to Shops"}
        </Button>
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-3xl border border-border/40 bg-secondary/40 shadow-cozy">
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
            <div className="flex gap-2">
              {product.image_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
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
            <div className="rounded-2xl bg-pink-50 p-5">
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
            <div className="rounded-2xl bg-pink-50 p-5">
              <span className="text-destructive font-medium">Out of stock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
