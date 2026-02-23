import { Outlet, Link } from "react-router-dom";
import { Store } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lavender-50 via-lavender-100 to-purple-50 p-4">
      {/* Subtle decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-pink-300/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-400/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Sugbu<span className="text-gradient">Shop</span>
          </span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
