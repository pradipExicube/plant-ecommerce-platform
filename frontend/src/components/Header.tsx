import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Leaf, Menu, X, User, Settings, Heart, Package } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useCurrency } from '../hooks/useCurrency';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { currency, setCurrency } = useCurrency();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
            Green<span className="text-primary">Leaf</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-primary [&.active]:font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1.5 transition-colors ${
                currency === 'INR'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              aria-label="Switch to INR"
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1.5 transition-colors ${
                currency === 'USD'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              aria-label="Switch to USD"
            >
              $ USD
            </button>
          </div>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: '/cart' })}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{userProfile?.name || 'My Account'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
                  <Package className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="hidden sm:flex"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-1 [&.active]:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <Button size="sm" onClick={handleAuth} disabled={isLoggingIn} className="mt-2">
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
