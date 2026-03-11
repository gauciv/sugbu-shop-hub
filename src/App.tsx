import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/auth";
import { PublicLayout } from "@/layouts/public-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { SellerLayout } from "@/layouts/seller-layout";
import { AdminLayout } from "@/layouts/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = lazy(() => import("@/pages/home"));
const ShopsPage = lazy(() => import("@/pages/shops"));
const ShopDetailPage = lazy(() => import("@/pages/shop-detail"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const ProductsPage = lazy(() => import("@/pages/products"));
const CartPage = lazy(() => import("@/pages/cart"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const OrderConfirmationPage = lazy(() => import("@/pages/order-confirmation"));
const OrdersPage = lazy(() => import("@/pages/orders"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const OrderDetailPage = lazy(() => import("@/pages/order-detail"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const AddressesPage = lazy(() => import("@/pages/addresses"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const VerifyEmailPage = lazy(() => import("@/pages/verify-email"));
const EmailConfirmedPage = lazy(() => import("@/pages/email-confirmed"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

const SellerDashboard = lazy(() => import("@/pages/seller/dashboard"));
const SellerProducts = lazy(() => import("@/pages/seller/products"));
const ProductForm = lazy(() => import("@/pages/seller/product-form"));
const SellerOrders = lazy(() => import("@/pages/seller/orders"));
const SellerOrderDetail = lazy(() => import("@/pages/seller/order-detail"));
const ShopSettings = lazy(() => import("@/pages/seller/shop-settings"));

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminShops = lazy(() => import("@/pages/admin/shops"));

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
  const { session, profile, loading } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <Loading />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;
  if (session) return <Navigate to="/" replace />;
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
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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

            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/shops" element={<AdminShops />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
