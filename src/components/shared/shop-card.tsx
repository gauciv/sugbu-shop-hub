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
      <Card className="card-cozy group overflow-hidden rounded-2xl border-border/60 transition-all duration-200 hover:border-purple-200">
        <div className="relative h-32 bg-gradient-to-br from-purple-100 via-pink-50 to-lavender-100">
          {shop.banner_url ? (
            <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="bg-dots absolute inset-0 opacity-40" />
          )}
        </div>
        <CardContent className="relative px-4 pb-4 pt-0">
          <Avatar className="-mt-7 h-14 w-14 border-[3px] border-white shadow-sm">
            <AvatarImage src={shop.logo_url ?? undefined} />
            <AvatarFallback className="bg-purple-100 text-sm font-semibold text-purple-500">
              {getInitials(shop.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-purple-500">
            {shop.name}
          </h3>
          {shop.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {shop.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-lavender-100 px-2.5 py-0.5">
              <Store className="h-3 w-3" />
              {shop.product_count ?? 0} products
            </span>
            {shop.address && (
              <span className="flex items-center gap-1 rounded-full bg-lavender-100 px-2.5 py-0.5">
                <MapPin className="h-3 w-3" /> {shop.address}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
