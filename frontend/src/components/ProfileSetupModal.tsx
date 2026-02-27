import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    saveProfile.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: () => toast.success('Welcome to GreenLeaf!'),
        onError: () => toast.error('Failed to save profile'),
      }
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-xl">Welcome to GreenLeaf!</DialogTitle>
          </div>
          <DialogDescription>
            Let's set up your profile to get started. This only takes a moment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Jane Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
