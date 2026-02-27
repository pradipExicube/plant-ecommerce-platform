import React, { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../hooks/useCart';

export default function PaymentSuccess() {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-3xl font-semibold mb-3">Order Confirmed! 🌿</h1>
        <p className="text-muted-foreground mb-2">
          Thank you for your purchase! Your plants are on their way.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          You'll receive a confirmation email shortly with your order details and tracking information.
        </p>

        <div className="bg-secondary rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">What happens next?</p>
              <p className="text-xs text-muted-foreground">We'll prepare your order within 1-2 business days</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🚚</span>
            </div>
            <div>
              <p className="font-medium text-sm">Delivery</p>
              <p className="text-xs text-muted-foreground">Estimated 3-5 business days</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🌱</span>
            </div>
            <div>
              <p className="font-medium text-sm">Plant Care</p>
              <p className="text-xs text-muted-foreground">Care instructions included with every order</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">
              <Package className="w-4 h-4 mr-2" /> View Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
