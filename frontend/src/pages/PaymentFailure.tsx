import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { XCircle, RefreshCw, ShoppingCart, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="font-display text-3xl font-semibold mb-3">Payment Failed</h1>
        <p className="text-muted-foreground mb-2">
          We couldn't process your payment. Don't worry — your cart is still saved.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Please check your payment details and try again, or contact your bank if the issue persists.
        </p>

        <div className="bg-secondary rounded-2xl p-5 mb-8 text-left">
          <p className="font-semibold text-sm mb-3">Common reasons for payment failure:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Insufficient funds
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Incorrect card details
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Card declined by bank
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              Network or connection issue
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate({ to: '/checkout' })} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: '/cart' })} className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Back to Cart
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
