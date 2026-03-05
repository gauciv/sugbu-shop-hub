import { Outlet, Link } from "react-router-dom";
import { Heart, Sparkles, ShoppingBag } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Desktop: Two-column layout */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left decorative side panel — hidden on mobile */}
        <div className="relative hidden flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-100/70 via-pink-100/50 to-lavender-50 px-12 py-16 lg:flex lg:w-1/2">
          {/* Floating decorative shapes — organic blobs */}
          <div className="pointer-events-none absolute left-12 top-24 h-16 w-16 blob bg-purple-200/50" />
          <div className="pointer-events-none absolute bottom-32 left-20 h-12 w-12 blob bg-pink-200/50" />
          <div className="pointer-events-none absolute right-16 top-1/3 h-10 w-10 blob bg-purple-200/50" />

          <div className="max-w-md text-center">
            {/* Brand icon */}
            <img src="/assets/sugbu-shop-hub-logo.png" alt="Sugbu Shop Hub" className="mx-auto mb-6 h-16 w-16 rounded-2xl object-cover border-2 border-purple-200" />

            <span className="mb-2 inline-block font-accent text-xl text-accent rotate-[-2deg]">~ your cozy corner ~</span>
            <h1 className="mb-3 font-display text-4xl font-bold tracking-tight text-foreground">
              Welcome to your{" "}
              <span className="text-pink-500">cozy corner</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of Cebu's small businesses thriving in our warm little marketplace.
            </p>

            <div className="inline-flex flex-col gap-4 text-sm text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100/70 border border-pink-200">
                  <ShoppingBag className="h-4 w-4 text-pink-500" />
                </div>
                <div className="text-left">
                  <span className="text-foreground">Browse & shop</span>
                  <p className="text-xs text-muted-foreground">Discover unique local finds</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100/70 border border-pink-200">
                  <Heart className="h-4 w-4 text-pink-500" />
                </div>
                <div className="text-left">
                  <span className="text-foreground">Made with love</span>
                  <p className="text-xs text-muted-foreground">Support local artisans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100/70 border border-pink-200">
                  <Sparkles className="h-4 w-4 text-pink-500" />
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
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 lg:p-8">
          {/* Mobile branding — visible on small screens */}
          <Link to="/" className="mb-6 flex flex-col items-center lg:hidden">
            <img src="/assets/sugbu-shop-hub-logo.png" alt="Sugbu Shop Hub" className="mb-3 h-12 w-12 rounded-2xl object-cover border border-purple-200" />
            <span className="text-lg font-bold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span> Hub
            </span>
          </Link>

          {/* Desktop branding above form */}
          <Link
            to="/"
            className="mb-6 hidden items-center gap-3 transition-opacity hover:opacity-80 lg:flex"
          >
            <img src="/assets/sugbu-shop-hub-logo.png" alt="Sugbu Shop Hub" className="h-10 w-10 rounded-xl object-cover border border-purple-200" />
            <span className="text-xl font-bold tracking-tight">
              Sugbu<span className="text-gradient">Shop</span> Hub
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
