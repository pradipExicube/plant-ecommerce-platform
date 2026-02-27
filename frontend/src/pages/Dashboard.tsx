import React from 'react';
import { Package, MapPin, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '../components/ProtectedRoute';
import OrderHistory from '../components/OrderHistory';
import SavedAddresses from '../components/SavedAddresses';
import Wishlist from '../components/Wishlist';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

function DashboardContent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 shadow-card mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl font-semibold text-primary">
            {userProfile?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">{userProfile?.name || 'My Account'}</h2>
          <p className="text-sm text-muted-foreground">{userProfile?.email || identity?.getPrincipal().toString().slice(0, 20) + '...'}</p>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-1.5">
            <MapPin className="w-4 h-4" /> Addresses
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="gap-1.5">
            <Heart className="w-4 h-4" /> Wishlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <OrderHistory />
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <SavedAddresses />
          </div>
        </TabsContent>

        <TabsContent value="wishlist">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <Wishlist />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Dashboard() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-semibold mb-6">My Dashboard</h1>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </main>
  );
}
