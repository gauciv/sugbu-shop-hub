import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { getShopProducts } from "@/api/products";
import { getShopOrders } from "@/api/orders";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
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
    { label: "Total Products", value: products.length, icon: Package, color: "text-violet-600 bg-violet-50" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-pink-600 bg-pink-50" },
    { label: "Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-fuchsia-600 bg-fuchsia-50" },
    { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}</p>
      </div>
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
