import React, { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useGetAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } from '../hooks/useQueries';
import type { Address } from '../backend';
import { toast } from 'sonner';

const emptyAddress: Omit<Address, 'id'> = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

export default function SavedAddresses() {
  const { data: addresses = [], isLoading } = useGetAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<Omit<Address, 'id'>>(emptyAddress);

  const openAdd = () => {
    setEditingAddress(null);
    setForm(emptyAddress);
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingAddress(addr);
    setForm({ street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddress.mutate(
        { ...form, id: editingAddress.id },
        {
          onSuccess: () => { toast.success('Address updated'); setDialogOpen(false); },
          onError: () => toast.error('Failed to update address'),
        }
      );
    } else {
      addAddress.mutate(
        { ...form, id: BigInt(0) },
        {
          onSuccess: () => { toast.success('Address added'); setDialogOpen(false); },
          onError: () => toast.error('Failed to add address'),
        }
      );
    }
  };

  const handleDelete = (id: bigint) => {
    deleteAddress.mutate(id, {
      onSuccess: () => toast.success('Address removed'),
      onError: () => toast.error('Failed to remove address'),
    });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Loading addresses...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Saved Addresses</h3>
        <Button size="sm" onClick={openAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {addresses.map(addr => (
            <div key={addr.id.toString()} className="bg-secondary rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{addr.street}</p>
                <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-xs text-muted-foreground">{addr.country}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(addr)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(addr.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Street</Label>
              <Input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ZIP Code</Label>
                <Input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addAddress.isPending || updateAddress.isPending}>
                {addAddress.isPending || updateAddress.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
