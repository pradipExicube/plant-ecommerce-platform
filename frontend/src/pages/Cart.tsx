import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCurrency } from '../hooks/useCurrency';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { formatPrice, currency } = useCurrency();

  const subtotalInr = Number(totalPrice) / 100;
  const shippingInr = subtotalInr > 50 ? 0 : 9.99;
  const taxInr = subtotalInr * 0.08;
  const totalInr = subtotalInr + shippingInr + taxInr;

  // Convert shipping/tax thresholds to display values
  // We store everything in INR paise internally; convert to display currency for UI
  const shippingPaise = BigInt(Math.round(shippingInr * 100));
  const taxPaise = BigInt(Math.round(taxInr * 100));
  const totalPaise = BigInt(Math.round(totalInr * 100));
  const remainingForFreeShipping = BigInt(Math.round(Math.max(0, 50 - subtotalInr) * 100));

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-9 h-9 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Looks like you haven't added any plants yet. Start exploring!
          </p>
          <Button asChild>
            <Link to="/products">Browse Plants</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/products' })} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Button>
      </div>

      <h1 className="font-display text-3xl font-semibold mb-8">
        Shopping Cart <span className="text-muted-foreground text-xl font-normal">({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const itemTotalPaise = BigInt(Math.round(Number(item.price) * item.quantity));
            return (
              <div key={item.productId.toString()} className="bg-card rounded-2xl p-4 shadow-card flex gap-4">
                <Link to="/products/$slug" params={{ slug: item.slug }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/products/$slug" params={{ slug: item.slug }}>
                      <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-primary font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-sm">{formatPrice(itemTotalPaise)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shippingInr === 0
                    ? <span className="text-primary">Free</span>
                    : formatPrice(shippingPaise)
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">{formatPrice(taxPaise)}</span>
              </div>
              {shippingInr > 0 && (
                <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                  🚚 Add {formatPrice(remainingForFreeShipping)} more for free shipping
                </p>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPaise)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-5 gap-2"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              🔒 Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
