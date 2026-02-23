import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { useCart, type CartProduct } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Trash2, ArrowRight, ImageOff } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const shopGroups = items.reduce<Record<string, { shopName: string; items: CartProduct[] }>>(
    (acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = { shopName: item.shopName, items: [] };
      }
      acc[item.shopId].items.push(item);
      return acc;
    },
    {}
  );

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse shops to find something you love."
          action={{ label: "Browse Shops", onClick: () => navigate("/shops") }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="space-y-6">
        {Object.entries(shopGroups).map(([shopId, group]) => (
          <Card key={shopId} className="border-border/60">
            <CardContent className="p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.shopName}
              </p>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-pink-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageOff className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">{item.name}</h3>
                          <p className="text-sm font-bold text-foreground">{formatPrice(item.price)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantitySelector
                          value={item.quantity}
                          max={item.stock}
                          onChange={(q) => updateQuantity(item.productId, q)}
                        />
                        <p className="text-sm font-semibold tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/checkout")}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-fuchsia-700"
        >
          Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
