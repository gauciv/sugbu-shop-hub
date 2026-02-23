import { Link } from "react-router-dom";
import { Store, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Shop } from "@/types";

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link to={`/shop/${shop.slug}`}>
      <Card className="group overflow-hidden border-border/60 transition-all duration-200 hover:border-purple-200 hover:shadow-md hover:shadow-purple-400/5">
        <div className="relative h-28 bg-gradient-to-br from-pink-100 via-purple-100 to-lavender-200">
          {shop.banner_url && (
            <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <CardContent className="relative px-4 pb-4 pt-0">
          <Avatar className="-mt-6 h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={shop.logo_url ?? undefined} />
            <AvatarFallback className="bg-purple-100 text-sm font-semibold text-purple-500">
              {getInitials(shop.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-purple-500">
            {shop.name}
          </h3>
          {shop.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {shop.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Store className="h-3 w-3" />
              {shop.product_count ?? 0} products
            </span>
            {shop.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {shop.address}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
