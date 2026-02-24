import { Outlet, Link } from "react-router-dom";
import { Store, Heart, Sparkles, ShoppingBag } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Desktop: Two-column layout */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left decorative side panel — hidden on mobile */}
        <div className="relative hidden flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 px-12 py-16 lg:flex lg:w-1/2">
          {/* Floating decorative shapes */}
          <div className="pointer-events-none absolute left-12 top-24 h-16 w-16 rounded-2xl bg-purple-100/60" />
          <div className="pointer-events-none absolute bottom-32 left-20 h-12 w-12 rounded-full bg-pink-100/60" />
          <div className="pointer-events-none absolute right-16 top-1/3 h-10 w-10 rounded-xl bg-purple-100/60" />

          <div className="max-w-md text-center">
            {/* Brand icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-purple-200">
              <Store className="h-8 w-8 text-purple-500" />
            </div>

            <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
              Welcome to your{" "}
              <span className="text-pink-400">cozy corner</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of Cebu's small businesses thriving in our warm little marketplace.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 border border-pink-200">
                  <ShoppingBag className="h-4 w-4 text-pink-400" />
                </div>
                <div className="text-left">
                  <span className="text-foreground">Browse & shop</span>
                  <p className="text-xs text-muted-foreground">Discover unique local finds</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 border border-pink-200">
                  <Heart className="h-4 w-4 text-pink-400" />
                </div>
                <div className="text-left">
                  <span className="text-foreground">Made with love</span>
                  <p className="text-xs text-muted-foreground">Support local artisans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 border border-pink-200">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                </div>
                <div className="text-left">
                  <span className="text-foreground">Local & handmade</span>
                  <p className="text-xs text-muted-foreground">Authentic Cebu crafts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: form area */}
        <div className="flex flex-1 flex-col items-center justify-center bg-background p-4 lg:p-8">
          {/* Mobile branding — visible on small screens */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-purple-200">
              <Store className="h-7 w-7 text-purple-500" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span>
            </span>
            <p className="mt-1 text-sm text-muted-foreground">Your cozy corner of Cebu</p>
          </div>

          {/* Desktop branding above form */}
          <Link
            to="/"
            className="mb-8 hidden items-center gap-3 transition-opacity hover:opacity-80 lg:flex"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-purple-200">
              <Store className="h-6 w-6 text-purple-500" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span>
            </span>
          </Link>

          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
