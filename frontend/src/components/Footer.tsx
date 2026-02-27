import React from 'react';
import { Link } from '@tanstack/react-router';
import { Leaf, Heart } from 'lucide-react';
import { SiInstagram, SiX } from 'react-icons/si';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'greenleaf-store');

  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-lg">
                Green<span className="text-primary">Leaf</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Bringing nature indoors and outdoors. Curated plants for every space, delivered with care.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiX className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  All Plants
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: 'indoor-plants' }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Indoor Plants
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: 'outdoor-plants' }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Outdoor Plants
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: 'pots' }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pots &amp; Planters
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} GreenLeaf Store. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
