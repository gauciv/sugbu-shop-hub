import { Outlet, Link } from "react-router-dom";
import { Store } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-violet-50 to-violet-100 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Sugbu<span className="text-violet-600">Shop</span>
          </span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
