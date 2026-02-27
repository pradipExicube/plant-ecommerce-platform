import React, { useState } from 'react';
import { CreditCard, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US, CA, GB, AU');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowedCountries = countries.split(',').map(c => c.trim()).filter(Boolean);
    setConfig.mutate(
      { secretKey: secretKey.trim(), allowedCountries },
      {
        onSuccess: () => toast.success('Stripe configured successfully!'),
        onError: (err) => toast.error(`Failed: ${err.message}`),
      }
    );
  };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Loading...</div>;

  if (isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">Stripe is Configured</h3>
        <p className="text-muted-foreground text-sm">Payment processing is ready to accept orders.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Configure Stripe</h3>
          <p className="text-xs text-muted-foreground">Set up payment processing for your store</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Stripe Secret Key</Label>
          <Input
            type="password"
            placeholder="sk_live_..."
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Find this in your Stripe Dashboard → API Keys</p>
        </div>
        <div className="space-y-1.5">
          <Label>Allowed Countries</Label>
          <Input
            placeholder="US, CA, GB, AU"
            value={countries}
            onChange={e => setCountries(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Comma-separated ISO country codes</p>
        </div>
        <Button type="submit" className="w-full" disabled={setConfig.isPending}>
          {setConfig.isPending ? 'Saving...' : 'Save Stripe Configuration'}
        </Button>
      </form>
    </div>
  );
}
