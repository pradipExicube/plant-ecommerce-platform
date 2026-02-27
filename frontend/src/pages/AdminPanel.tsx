import React from 'react';
import { Package, Tag, ClipboardList, CreditCard, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductManagement from '../components/ProductManagement';
import CategoryManagement from '../components/CategoryManagement';
import OrderManagement from '../components/OrderManagement';
import StripeSetup from '../components/StripeSetup';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

function AdminContent() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You don't have admin privileges to access this panel.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-6 flex-wrap h-auto gap-1">
        <TabsTrigger value="products" className="gap-1.5">
          <Package className="w-4 h-4" /> Products
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-1.5">
          <Tag className="w-4 h-4" /> Categories
        </TabsTrigger>
        <TabsTrigger value="orders" className="gap-1.5">
          <ClipboardList className="w-4 h-4" /> Orders
        </TabsTrigger>
        <TabsTrigger value="stripe" className="gap-1.5">
          <CreditCard className="w-4 h-4" /> Stripe
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <ProductManagement />
        </div>
      </TabsContent>

      <TabsContent value="categories">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <CategoryManagement />
        </div>
      </TabsContent>

      <TabsContent value="orders">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <OrderManagement />
        </div>
      </TabsContent>

      <TabsContent value="stripe">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <StripeSetup />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function AdminPanel() {
  const { identity } = useInternetIdentity();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage your store</p>
        </div>
      </div>
      <ProtectedRoute>
        <AdminContent />
      </ProtectedRoute>
    </main>
  );
}
