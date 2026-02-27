import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { MapPin, CreditCard, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '../components/ProtectedRoute';
import { useGetAddresses, useAddAddress, useCreateCheckoutSession } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import type { Address, ShoppingItem } from '../backend';
import { toast } from 'sonner';

type AddressForm = Omit<Address, 'id'>;
const emptyForm: AddressForm = { street: '', city: '', state: '', zip: '', country: '' };

function CheckoutContent() {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const { data: addresses = [] } = useGetAddresses();
  const addAddress = useAddAddress();
  const createCheckoutSession = useCreateCheckoutSession();
  const { formatPrice } = useCurrency();

  const [selectedAddressId, setSelectedAddressId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressForm>(emptyForm);

  const subtotalInr = Number(totalPrice) / 100;
  const shippingInr = subtotalInr > 50 ? 0 : 9.99;
  const taxInr = subtotalInr * 0.08;
  const totalInr = subtotalInr + shippingInr + taxInr;

  const shippingPaise = BigInt(Math.round(shippingInr * 100));
  const taxPaise = BigInt(Math.round(taxInr * 100));
  const totalPaise = BigInt(Math.round(totalInr * 100));

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    addAddress.mutate(
      { ...newAddress, id: BigInt(0) },
      {
        onSuccess: (newId) => {
          setSelectedAddressId(newId);
          setShowAddForm(false);
          setNewAddress(emptyForm);
          toast.success('Address saved');
        },
        onError: () => toast.error('Failed to save address'),
      }
    );
  };

  const handleCheckout = async () => {
    if (!selectedAddress && addresses.length > 0) {
      toast.error('Please select a delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Stripe always processes in the base currency (INR paise stored in backend)
    const shoppingItems: ShoppingItem[] = items.map(item => ({
      productName: item.name,
      productDescription: item.name,
      currency: 'inr',
      quantity: BigInt(item.quantity),
      priceInCents: item.price,
    }));

    createCheckoutSession.mutate(shoppingItems, {
      onSuccess: (session) => {
        if (!session?.url) {
          toast.error('Payment session error. Please try again.');
          return;
        }
        window.location.href = session.url;
      },
      onError: (err) => {
        toast.error(`Checkout failed: ${err.message}`);
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild><Link to="/products">Browse Plants</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Address + Payment */}
      <div className="lg:col-span-2 space-y-6">
        {/* Delivery Address */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Delivery Address</h2>
          </div>

          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map(addr => (
                <button
                  key={addr.id.toString()}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    (selectedAddressId === addr.id || (!selectedAddressId && addr === addresses[0]))
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{addr.street}</p>
                      <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-xs text-muted-foreground">{addr.country}</p>
                    </div>
                    {(selectedAddressId === addr.id || (!selectedAddressId && addr === addresses[0])) && (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add New Address'}
          </Button>

          {showAddForm && (
            <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Street Address</Label>
                <Input value={newAddress.street} onChange={e => setNewAddress(f => ({ ...f, street: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={newAddress.city} onChange={e => setNewAddress(f => ({ ...f, city: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input value={newAddress.state} onChange={e => setNewAddress(f => ({ ...f, state: e.target.value }))} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ZIP Code</Label>
                  <Input value={newAddress.zip} onChange={e => setNewAddress(f => ({ ...f, zip: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input value={newAddress.country} onChange={e => setNewAddress(f => ({ ...f, country: e.target.value }))} required />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={addAddress.isPending}>
                {addAddress.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </form>
          )}
        </div>

        {/* Payment */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Payment</h2>
            <Badge variant="secondary" className="text-xs ml-auto">Powered by Stripe</Badge>
          </div>
          <div className="bg-secondary rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You'll be redirected to Stripe's secure checkout to complete your payment.
            </p>
            <div className="flex justify-center gap-3 mt-3">
              {['💳', '🔒', '✅'].map((icon, i) => (
                <span key={i} className="text-xl">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
          <h2 className="font-display text-xl font-semibold mb-5">Order Summary</h2>

          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {items.map(item => {
              const itemTotalPaise = BigInt(Math.round(Number(item.price) * item.quantity));
              return (
                <div key={item.productId.toString()} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0">
                    {formatPrice(itemTotalPaise)}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingInr === 0
                  ? <span className="text-primary font-medium">Free</span>
                  : formatPrice(shippingPaise)
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>{formatPrice(taxPaise)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPaise)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-5 gap-2"
            size="lg"
            onClick={handleCheckout}
            disabled={createCheckoutSession.isPending}
          >
            {createCheckoutSession.isPending ? (
              <>Processing...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Pay {formatPrice(totalPaise)}</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            🔒 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-semibold mb-8">Checkout</h1>
      <ProtectedRoute>
        <CheckoutContent />
      </ProtectedRoute>
    </main>
  );
}
