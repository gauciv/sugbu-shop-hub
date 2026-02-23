import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerLayout() {
  const { profile, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!profile || profile.role !== "seller") {
    return <Navigate to="/login" replace />;
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
