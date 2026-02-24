import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Store, LogOut, Package, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth";
import { useCartItemCount } from "@/hooks/use-cart";
import { getInitials, cn } from "@/lib/utils";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shops", href: "/shops" },
  { label: "Products", href: "/products" },
];

export function SiteHeader() {
  const { profile, signOut } = useAuth();
  const cartCount = useCartItemCount();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 shadow-cozy backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-cozy">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Sugbu<span className="text-gradient">Shop</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
              return (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full text-sm transition-colors",
                      isActive
                        ? "bg-purple-100 font-medium text-purple-700"
                        : "text-muted-foreground hover:bg-purple-50/60 hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-purple-200">
                    <AvatarFallback className="bg-purple-100 text-xs font-semibold text-purple-700">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <DropdownMenuSeparator />
                {profile.role === "seller" && (
                  <DropdownMenuItem onClick={() => navigate("/seller/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="mr-2 h-4 w-4" /> My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-4 mt-2 rounded-2xl bg-white shadow-cozy-lg md:hidden">
          <nav className="flex flex-col gap-1 px-3 py-3">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
              return (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start rounded-full",
                      isActive
                        ? "bg-purple-100 font-medium text-purple-700"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            {!profile && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full rounded-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
