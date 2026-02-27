import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Leaf, Sun, Droplets, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import { useGetProducts } from '../hooks/useQueries';
import { toast } from 'sonner';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Plant Parent',
    text: 'My monstera arrived in perfect condition! The packaging was eco-friendly and the plant was even bigger than expected.',
    rating: 5,
  },
  {
    name: 'James K.',
    role: 'Home Decorator',
    text: 'GreenLeaf has transformed my living space. The care instructions are incredibly helpful for a beginner like me.',
    rating: 5,
  },
  {
    name: 'Priya L.',
    role: 'Garden Enthusiast',
    text: "Outstanding quality and fast delivery. I've ordered three times now and every plant has been healthy and vibrant.",
    rating: 5,
  },
];

const CATEGORIES = [
  {
    name: 'Indoor Plants',
    slug: 'indoor-plants',
    description: 'Bring life to your living spaces',
    image: '/assets/generated/category-indoor.dim_600x400.png',
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    name: 'Outdoor Plants',
    slug: 'outdoor-plants',
    description: 'Transform your garden & patio',
    image: '/assets/generated/category-outdoor.dim_600x400.png',
    icon: <Sun className="w-5 h-5" />,
  },
  {
    name: 'Pots & Planters',
    slug: 'pots',
    description: 'Stylish homes for your plants',
    image: '/assets/generated/category-pots.dim_600x400.png',
    icon: <Droplets className="w-5 h-5" />,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGetProducts();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featuredProducts = products.slice(0, 4);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success('Thanks for subscribing! 🌿');
    setEmail('');
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[520px] md:h-[600px]">
          <img
            src="/assets/generated/hero-banner.dim_1440x600.png"
            alt="Beautiful indoor plants"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl animate-fade-in">
                <Badge className="mb-4 bg-primary/90 text-primary-foreground border-0">
                  🌿 Free shipping on orders over $50
                </Badge>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4">
                  Bring Nature<br />Into Your Home
                </h1>
                <p className="text-white/85 text-lg mb-8 leading-relaxed">
                  Curated indoor & outdoor plants, delivered with care. Transform any space into a green sanctuary.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate({ to: '/products' })}
                    className="gap-2 text-base"
                  >
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white text-base"
                    onClick={() => navigate({ to: '/products', search: { category: 'indoor-plants' } })}
                  >
                    Indoor Plants
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-secondary border-y border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🌱', text: 'Sustainably Grown' },
              { icon: '📦', text: 'Eco Packaging' },
              { icon: '🚚', text: 'Fast Delivery' },
              { icon: '💚', text: 'Plant Guarantee' },
            ].map(f => (
              <div key={f.text} className="flex items-center justify-center gap-2 py-2">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium text-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">Shop by Category</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find the perfect plants for every space and style
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to="/products"
              search={{ category: cat.slug }}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 text-white mb-1">
                  {cat.icon}
                  <h3 className="font-display text-xl font-semibold">{cat.name}</h3>
                </div>
                <p className="text-white/80 text-sm">{cat.description}</p>
                <div className="flex items-center gap-1 text-white/90 text-sm mt-2 font-medium">
                  Shop now <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2">Featured Plants</h2>
              <p className="text-muted-foreground">Our most loved plants, handpicked for you</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex gap-1">
              <Link to="/products">View All <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products yet. Check back soon!</p>
              <p className="text-xs text-muted-foreground mt-2">Admin: Add products via the Admin Panel</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/products">View All Plants <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground">Thousands of happy plant parents</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-semibold text-primary-foreground mb-3">
              Stay in the Loop
            </h2>
            <p className="text-primary-foreground/80 mb-6 text-sm">
              Get plant care tips, new arrivals, and exclusive offers delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="bg-primary-foreground/20 rounded-xl px-6 py-4 text-primary-foreground font-medium">
                🌿 You're subscribed! Welcome to the GreenLeaf family.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 flex-1"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="flex-shrink-0"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
