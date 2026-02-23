import { Outlet, Link } from "react-router-dom";
import { Store, Heart, Sparkles } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-lavender-50 via-lavender-100 to-purple-50">
      {/* Dot pattern overlay */}
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" />

      {/* Subtle decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-pink-300/15 blur-3xl" />

      {/* Desktop: Two-column layout */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left decorative side panel — hidden on mobile */}
        <div className="relative hidden flex-col items-center justify-center gap-6 px-12 py-16 lg:flex lg:w-1/2">
          {/* Floating decorative shapes */}
          <div className="animate-float pointer-events-none absolute left-12 top-24 h-16 w-16 rounded-2xl bg-purple-200/40" />
          <div className="animate-float-slow pointer-events-none absolute bottom-32 left-20 h-12 w-12 rounded-full bg-pink-200/50" />
          <div className="animate-float pointer-events-none absolute right-16 top-1/3 h-10 w-10 rounded-xl bg-lavender-200/60" />
          <div className="animate-float-slow pointer-events-none absolute bottom-48 right-24 h-14 w-14 rounded-2xl bg-purple-300/30" />
          <div className="animate-float pointer-events-none absolute left-1/3 top-2/3 h-8 w-8 rounded-full bg-pink-300/40" />

          <div className="max-w-md text-center">
            {/* Brand icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-cozy-lg">
              <Store className="h-8 w-8 text-white" />
            </div>

            <h1 className="mb-3 text-4xl font-bold tracking-tight">
              Welcome to your{" "}
              <span className="text-gradient">cozy corner</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of Cebu's small businesses thriving in our warm little marketplace.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Made with love</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Local & handmade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: form area */}
        <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
          {/* Mobile branding — visible on small screens */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-cozy">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-400/20">
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
