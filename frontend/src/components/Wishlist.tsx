import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetWishlist, useRemoveFromWishlist, useGetProducts } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export default function Wishlist() {
  const { data: wishlistItems = [], isLoading } = useGetWishlist();
  const { data: allProducts = [] } = useGetProducts();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const wishlistProducts = wishlistItems.map(item => {
    return allProducts.find(p => p.id === item.productId);
  }).filter(Boolean);

  const handleRemove = (productId: bigint) => {
    removeFromWishlist.mutate(productId, {
      onSuccess: () => toast.success('Removed from wishlist'),
      onError: () => toast.error('Failed to remove'),
    });
  };

  const handleAddToCart = (product: NonNullable<typeof wishlistProducts[0]>) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/assets/generated/product-placeholder.dim_800x800.png',
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Loading wishlist...</div>;
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
        <p className="text-muted-foreground text-sm mb-4">Save plants you love to your wishlist.</p>
        <Button asChild variant="outline">
          <Link to="/products">Browse Plants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {wishlistProducts.map(product => {
        if (!product) return null;
        const imageUrl = product.images[0] || '/assets/generated/product-placeholder.dim_800x800.png';
        return (
          <div key={product.id.toString()} className="bg-secondary rounded-xl p-4 flex items-center gap-4">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              <img
                src={imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png'; }}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to="/products/$slug" params={{ slug: product.slug }}>
                <p className="font-medium text-sm hover:text-primary transition-colors">{product.name}</p>
              </Link>
              <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === BigInt(0)}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(product.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
