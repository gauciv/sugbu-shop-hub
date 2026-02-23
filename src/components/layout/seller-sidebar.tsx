import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Settings, ArrowLeft, Store, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/seller/dashboard" },
  { label: "Products", icon: Package, href: "/seller/products" },
  { label: "Orders", icon: ShoppingBag, href: "/seller/orders" },
  { label: "Shop Settings", icon: Settings, href: "/seller/shop-settings" },
];

interface SellerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SellerSidebar({ collapsed, onToggle }: SellerSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-border/60 bg-white transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b border-border/60",
        collapsed ? "justify-center px-2" : "gap-2 px-4"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Store className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold tracking-tight">
              Sugbu<span className="text-violet-600">Shop</span>
            </span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Seller Portal
            </p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed ? "p-1.5" : "p-3")}>
        {navItems.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.href !== "/seller/dashboard" && location.pathname.startsWith(item.href));
          return (
            <Link key={item.href} to={item.href} title={collapsed ? item.label : undefined}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full font-medium",
                  collapsed ? "justify-center px-0" : "justify-start gap-3",
                  active
                    ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                    : "text-muted-foreground hover:bg-pink-50/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className={cn("space-y-1 border-t border-border/60", collapsed ? "p-1.5" : "p-3")}>
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            "w-full text-muted-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-3"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </Button>
        <Link to="/" title={collapsed ? "Back to Store" : undefined}>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-muted-foreground",
              collapsed ? "justify-center px-0" : "justify-start gap-3"
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed && "Back to Store"}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
