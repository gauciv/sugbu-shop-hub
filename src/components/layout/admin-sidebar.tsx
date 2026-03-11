import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard",  icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Shops",      icon: Store,            href: "/admin/shops" },
  { label: "Users",      icon: Users,            href: "/admin/users" },
  { label: "Products",   icon: Package,          href: "/admin/products" },
  { label: "Orders",     icon: ShoppingBag,      href: "/admin/orders" },
  { label: "Categories", icon: Tag,              href: "/admin/categories" },
  { label: "Financials", icon: DollarSign,       href: "/admin/financials" },
  { label: "Support",    icon: MessageSquare,    href: "/admin/support" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border/60 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Floating collapse/expand toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm transition-colors hover:bg-indigo-50"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Logo / header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/60",
          collapsed ? "justify-center px-2" : "gap-2 px-4"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          <img
            src="/assets/sugbu-shop-hub-logo.png"
            alt="Sugbu Shop Hub"
            className="h-8 w-8 object-cover"
          />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span> Hub
            </span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin Portal
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "p-1.5" : "p-3")}>
        {navItems.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              location.pathname.startsWith(item.href));
          return (
            <Link key={item.href} to={item.href} title={collapsed ? item.label : undefined}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full font-medium",
                  collapsed ? "justify-center px-0" : "justify-start gap-3",
                  active
                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Back to store */}
      <div className={cn("border-t border-border/60", collapsed ? "p-1.5" : "p-3")}>
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
