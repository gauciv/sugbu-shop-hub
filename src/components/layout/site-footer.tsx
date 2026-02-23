import { Link } from "react-router-dom";
import { Store } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-white to-lavender-100/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-400 to-pink-400 shadow-sm shadow-purple-400/15">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span>
            </span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/shops" className="hover:text-purple-400">Shops</Link>
            <Link to="/products" className="hover:text-purple-400">Products</Link>
            <Link to="/register" className="hover:text-purple-400">Sell on SugbuShop</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            Supporting small businesses in Cebu
          </p>
        </div>
      </div>
    </footer>
  );
}
