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
    <Link to={`/shop/${shop.slug}`} className="block h-full">
      <Card className="card-cozy group flex h-full flex-col overflow-hidden rounded-xl border-border/60 transition-all duration-200 hover:border-pink-200">
        <div className="relative h-24 shrink-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
          {shop.banner_url ? (
            <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <CardContent className="relative flex flex-1 flex-col px-3 pb-3 pt-0">
          <Avatar className="-mt-6 h-12 w-12 border-[3px] border-white shadow-sm">
            <AvatarImage src={shop.logo_url ?? undefined} />
            <AvatarFallback className="bg-purple-50 text-xs font-bold text-purple-500">
              {getInitials(shop.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-1.5 truncate text-sm font-bold text-foreground group-hover:text-pink-500">
            {shop.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {shop.description || "\u00A0"}
          </p>
          <div className="mt-auto flex items-center gap-2 pt-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-lavender-100 px-2 py-0.5">
              <Store className="h-3 w-3" />
              {shop.product_count ?? 0} products
            </span>
            {shop.address && (
              <span className="flex items-center gap-1 truncate rounded-full bg-lavender-100 px-2 py-0.5">
                <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{shop.address}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
