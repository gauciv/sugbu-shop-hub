import { Outlet, Link } from "react-router-dom";
import { Store, Heart, Sparkles, ShoppingBag } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Desktop: Two-column layout */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left decorative side panel — hidden on mobile */}
        <div className="bg-grain relative hidden flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 px-12 py-16 lg:flex lg:w-1/2">
          {/* Floating decorative shapes */}
          <div className="animate-float pointer-events-none absolute left-12 top-24 h-16 w-16 rounded-2xl bg-white/10" />
          <div className="animate-float-slow pointer-events-none absolute bottom-32 left-20 h-12 w-12 rounded-full bg-pink-400/20" />
          <div className="animate-float pointer-events-none absolute right-16 top-1/3 h-10 w-10 rounded-xl bg-white/10" />

          <div className="max-w-md text-center">
            {/* Brand icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Store className="h-8 w-8 text-white" />
            </div>

            <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
              Welcome to your{" "}
              <span className="text-pink-300">cozy corner</span>
            </h1>

            <p className="mb-8 text-lg text-purple-200">
              Join thousands of Cebu's small businesses thriving in our warm little marketplace.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-white">Browse & shop</span>
                  <p className="text-xs text-purple-200">Discover unique local finds</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-white">Made with love</span>
                  <p className="text-xs text-purple-200">Support local artisans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-white">Local & handmade</span>
                  <p className="text-xs text-purple-200">Authentic Cebu crafts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: form area */}
        <div className="flex flex-1 flex-col items-center justify-center bg-background p-4 lg:p-8">
          {/* Mobile branding — visible on small screens */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-cozy">
              <Store className="h-7 w-7 text-white" />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-cozy">
              <Store className="h-6 w-6 text-white" />
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
