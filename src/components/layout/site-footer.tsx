import { Link } from "react-router-dom";
import { Store, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative">
      <div className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Top row: Brand + Nav */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand + Tagline */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Sugbu<span className="text-gradient">Shop</span>
                </span>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Your cozy marketplace for local Cebu finds
              </p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap items-center gap-1">
              <Link
                to="/shops"
                className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-purple-50 hover:text-purple-500"
              >
                Shops
              </Link>
              <Link
                to="/products"
                className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-purple-50 hover:text-purple-500"
              >
                Products
              </Link>
              <Link
                to="/register"
                className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-purple-50 hover:text-purple-500"
              >
                Sell on SugbuShop
              </Link>
            </nav>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-border/40" />

          {/* Bottom row: Copyright */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with
              <Heart className="inline h-3.5 w-3.5 fill-pink-400 text-pink-400" />
              for Cebu&apos;s small businesses
            </p>
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} SugbuShop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
