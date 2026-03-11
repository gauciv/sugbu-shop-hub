import { useEffect, useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { Menu, ShieldAlert } from "lucide-react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { useAuth } from "@/context/auth";
import { getMyShop } from "@/api/shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Shop } from "@/types";

export function SellerLayout() {
  const { profile, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(
    !!profile && profile.role === "seller"
  );

  useEffect(() => {
    if (!profile || profile.role !== "seller") return;
    getMyShop(profile.id)
      .then(setShop)
      .finally(() => setShopLoading(false));
  }, [profile]);

  if (loading || shopLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!profile || profile.role !== "seller") {
    return <Navigate to="/login" replace />;
  }

  if (shop?.approval_status === "suspended") {
    return (
      <div className="flex h-screen items-center justify-center bg-lavender-50 p-4">
        <Card className="max-w-md border-red-200">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-7 w-7 text-red-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Shop Suspended</h1>
            <p className="text-sm text-muted-foreground">
              Your shop has been suspended by the platform administrator. You will not
              be able to access your seller dashboard until your shop is reinstated.
            </p>
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, please contact support for assistance.
            </p>
            <div className="flex gap-2 pt-2">
              <Link to="/support/new">
                <Button variant="outline">Contact Support</Button>
              </Link>
              <Link to="/">
                <Button>Back to Store</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-lavender-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SellerSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full w-64">
            <SellerSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center border-b border-border/60 bg-white px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 text-sm font-bold tracking-tight">
            Sugbu<span className="text-gradient">Shop</span>
          </span>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
