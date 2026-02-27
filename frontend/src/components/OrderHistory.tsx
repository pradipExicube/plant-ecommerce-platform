import React from 'react';
import { Package, Clock } from 'lucide-react';

export default function OrderHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">No Orders Yet</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Your order history will appear here once you make your first purchase.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-4 py-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Order management coming soon</span>
      </div>
    </div>
  );
}
