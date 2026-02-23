import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Settings, ArrowLeft, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/seller/dashboard" },
  { label: "Products", icon: Package, href: "/seller/products" },
  { label: "Orders", icon: ShoppingBag, href: "/seller/orders" },
  { label: "Shop Settings", icon: Settings, href: "/seller/shop-settings" },
];

export function SellerSidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight">
            Sugbu<span className="text-violet-600">Shop</span>
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Seller Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.href !== "/seller/dashboard" && location.pathname.startsWith(item.href));
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 font-medium",
                  active
                    ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                    : "text-muted-foreground hover:bg-pink-50/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Button>
        </Link>
      </div>
    </aside>
  );
}
