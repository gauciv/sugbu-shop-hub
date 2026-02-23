import { Store } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-pink-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Sugbu<span className="text-violet-600">Shop</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Supporting small businesses in Cebu
          </p>
        </div>
      </div>
    </footer>
  );
}
