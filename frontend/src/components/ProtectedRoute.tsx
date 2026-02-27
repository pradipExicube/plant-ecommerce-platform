import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Leaf, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  isAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, isAdmin = false }: ProtectedRouteProps) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please login to access this page.
          </p>
          <Button onClick={login} disabled={isLoggingIn} className="w-full sm:w-auto">
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
