import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './hooks/useCart';
import { CurrencyProvider } from './hooks/useCurrency';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';

import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      {!isInitializing && <ProfileSetupModal open={showProfileSetup} />}
      <Toaster position="top-right" richColors />
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductListing,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$slug',
  component: ProductDetails,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  checkoutRoute,
  dashboardRoute,
  adminRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </CurrencyProvider>
  );
}
