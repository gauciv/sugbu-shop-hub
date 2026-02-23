import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/auth";
import { PublicLayout } from "@/layouts/public-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { SellerLayout } from "@/layouts/seller-layout";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = lazy(() => import("@/pages/home"));
const ShopsPage = lazy(() => import("@/pages/shops"));
const ShopDetailPage = lazy(() => import("@/pages/shop-detail"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const CartPage = lazy(() => import("@/pages/cart"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const OrderConfirmationPage = lazy(() => import("@/pages/order-confirmation"));
const OrdersPage = lazy(() => import("@/pages/orders"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

const SellerDashboard = lazy(() => import("@/pages/seller/dashboard"));
const SellerProducts = lazy(() => import("@/pages/seller/products"));
const ProductForm = lazy(() => import("@/pages/seller/product-form"));
const SellerOrders = lazy(() => import("@/pages/seller/orders"));
const SellerOrderDetail = lazy(() => import("@/pages/seller/order-detail"));
const ShopSettings = lazy(() => import("@/pages/seller/shop-settings"));

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-8 w-32" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <Loading />;
  if (!profile) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shops" element={<ShopsPage />} />
              <Route path="/shop/:slug" element={<ShopDetailPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<SellerLayout />}>
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/products" element={<SellerProducts />} />
              <Route path="/seller/products/new" element={<ProductForm />} />
              <Route path="/seller/products/:id/edit" element={<ProductForm />} />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
              <Route path="/seller/shop-settings" element={<ShopSettings />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
