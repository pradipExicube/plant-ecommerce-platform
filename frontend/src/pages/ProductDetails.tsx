import React, { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { ShoppingCart, Heart, ArrowLeft, Star, Leaf, Sun, Droplets, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageGallery from '../components/ImageGallery';
import ProductCard from '../components/ProductCard';
import { useGetProductBySlug, useGetProductsByCategory, useAddToWishlist, useGetReviews, useAddReview } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';

const SPEC_ICONS: Record<string, React.ReactNode> = {
  sunlight: <Sun className="w-4 h-4" />,
  water: <Droplets className="w-4 h-4" />,
  size: <Ruler className="w-4 h-4" />,
  type: <Leaf className="w-4 h-4" />,
};

function getSpecIcon(key: string) {
  const lower = key.toLowerCase();
  for (const [k, icon] of Object.entries(SPEC_ICONS)) {
    if (lower.includes(k)) return icon;
  }
  return <Leaf className="w-4 h-4" />;
}

export default function ProductDetails() {
  const { slug } = useParams({ from: '/products/$slug' });
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { identity } = useInternetIdentity();
  const addToWishlist = useAddToWishlist();
  const addReview = useAddReview();
  const { formatPrice } = useCurrency();

  const { data: product, isLoading } = useGetProductBySlug(slug);
  const { data: relatedProducts = [] } = useGetProductsByCategory(product?.category || '');
  const { data: reviews = [] } = useGetReviews(product?.id || BigInt(0));

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isOutOfStock = product ? product.stock === BigInt(0) : false;
  const related = relatedProducts.filter(p => p.id !== product?.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/assets/generated/product-placeholder.dim_800x800.png',
        slug: product.slug,
      });
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = () => {
    if (!identity) { toast.error('Please login to save to wishlist'); return; }
    if (!product) return;
    addToWishlist.mutate(product.id, {
      onSuccess: () => toast.success('Added to wishlist'),
      onError: () => toast.error('Failed to add to wishlist'),
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    addReview.mutate(
      { productId: product.id, rating: BigInt(reviewRating), comment: reviewComment },
      {
        onSuccess: () => { toast.success('Review submitted!'); setReviewComment(''); setReviewRating(5); },
        onError: () => toast.error('Failed to submit review'),
      }
    );
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🌿</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Plant Not Found</h2>
        <p className="text-muted-foreground mb-6">This plant may have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate({ to: '/products' })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Button>
      </main>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <ImageGallery images={product.images} alt={product.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <Badge variant="secondary" className="capitalize mb-2 text-xs">{product.category}</Badge>
              <h1 className="font-display text-3xl font-semibold leading-tight">{product.name}</h1>
            </div>
          </div>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {isOutOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {product.stock.toString()} in stock
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Available Sizes</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <Badge key={v} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 font-medium text-sm min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(Number(product.stock), q + 1))}
                className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                disabled={isOutOfStock}
              >
                +
              </button>
            </div>
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
              disabled={addToWishlist.isPending}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <div className="mt-2">
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {product.specifications.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                    <span className="text-primary">{getSpecIcon(key)}</span>
                    <div>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Care + Reviews */}
      <Tabs defaultValue="care" className="mb-16">
        <TabsList>
          <TabsTrigger value="care">Care Instructions</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="care" className="mt-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">How to Care for Your {product.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Sun className="w-5 h-5" />, title: 'Light', desc: 'Place in bright, indirect sunlight for best growth.' },
                { icon: <Droplets className="w-5 h-5" />, title: 'Water', desc: 'Water when the top inch of soil feels dry.' },
                { icon: <Leaf className="w-5 h-5" />, title: 'Soil', desc: 'Use well-draining potting mix for healthy roots.' },
              ].map(tip => (
                <div key={tip.title} className="flex gap-3 p-4 bg-secondary rounded-xl">
                  <span className="text-primary mt-0.5">{tip.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-1">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Number(review.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.userId.toString().slice(0, 12)}...</span>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              ))
            )}

            {identity && (
              <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-border space-y-3">
                <h4 className="font-semibold text-sm">Write a Review</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                <Button type="submit" size="sm" disabled={addReview.isPending}>
                  {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.id.toString()} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
