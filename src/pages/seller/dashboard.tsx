import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopProducts } from "@/api/products";
import { getShopOrders } from "@/api/orders";
import { formatPrice, getInitials } from "@/lib/utils";
import { Package, ShoppingBag, DollarSign, TrendingUp, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop, Product, Order } from "@/types";

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const s = await getMyShop(profile.id);
        setShop(s);
        if (s) {
          const [p, o] = await Promise.all([
            getShopProducts(s.id),
            getShopOrders(s.id),
          ]);
          setProducts(p);
          setOrders(o);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Set up your shop first</h2>
        <p className="mt-1 text-muted-foreground">Go to Shop Settings to create your store.</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-purple-400 bg-purple-50" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-pink-400 bg-pink-50" },
    { label: "Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-pink-400 bg-pink-50" },
    { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Shop profile card */}
      <Card className="overflow-hidden border-border/60">
        <div className="relative h-24 bg-gradient-to-br from-pink-50 via-purple-50 to-lavender-100">
          {shop.banner_url && (
            <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <CardContent className="relative px-5 pb-5 pt-0">
          <div className="flex items-end gap-4">
            <Avatar className="-mt-8 h-16 w-16 border-4 border-white shadow-md">
              <AvatarImage src={shop.logo_url ?? undefined} />
              <AvatarFallback className="bg-purple-100 text-sm font-bold text-purple-400">
                {getInitials(shop.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold tracking-tight">{shop.name}</h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, {profile?.full_name}
              </p>
            </div>
            <Link to="/seller/shop-settings">
              <Button variant="outline" size="sm" className="border-border/60">
                <Settings className="mr-1.5 h-3.5 w-3.5" /> Edit Shop
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
