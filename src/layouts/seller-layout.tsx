import { Outlet, Navigate } from "react-router-dom";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { useAuth } from "@/context/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!profile || profile.role !== "seller") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-pink-50/20">
      <SellerSidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
