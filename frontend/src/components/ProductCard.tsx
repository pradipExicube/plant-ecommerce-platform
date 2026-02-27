import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddToWishlist } from '../hooks/useQueries';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { identity } = useInternetIdentity();
  const addToWishlist = useAddToWishlist();
  const { formatPrice } = useCurrency();

  const imageUrl = product.images[0] || '/assets/generated/product-placeholder.dim_800x800.png';
  const isOutOfStock = product.stock === BigInt(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!identity) {
      toast.error('Please login to save to wishlist');
      return;
    }
    addToWishlist.mutate(product.id, {
      onSuccess: () => toast.success('Added to wishlist'),
      onError: () => toast.error('Failed to add to wishlist'),
    });
  };

  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-semibold">Out of Stock</Badge>
            </div>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card shadow-xs"
          >
            <Heart className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>
          {product.category && (
            <Badge className="absolute top-3 left-3 text-xs capitalize bg-primary/90 text-primary-foreground">
              {product.category}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary text-base">{formatPrice(product.price)}</span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="h-8 text-xs gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
