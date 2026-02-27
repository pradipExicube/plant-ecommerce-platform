import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useGetCategories } from '../hooks/useQueries';
import type { Product, CreateProductPayload } from '../backend';
import { toast } from 'sonner';

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  images: string;
  variants: string;
  specifications: { key: string; value: string }[];
};

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  images: '',
  variants: '',
  specifications: [{ key: '', value: '' }],
};

export default function ProductManagement() {
  const { data: products = [], isLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      price: (Number(product.price) / 100).toString(),
      stock: product.stock.toString(),
      images: product.images.join('\n'),
      variants: product.variants.join('\n'),
      specifications: product.specifications.length > 0
        ? product.specifications.map(([k, v]) => ({ key: k, value: v }))
        : [{ key: '', value: '' }],
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(form.price) * 100);
    const specs: [string, string][] = form.specifications
      .filter(s => s.key.trim() && s.value.trim())
      .map(s => [s.key.trim(), s.value.trim()]);

    const payload: CreateProductPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: BigInt(priceInCents),
      stock: BigInt(parseInt(form.stock) || 0),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      variants: form.variants.split('\n').map(s => s.trim()).filter(Boolean),
      specifications: specs,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { ...payload, id: editingProduct.id },
        {
          onSuccess: () => { toast.success('Product updated'); setDialogOpen(false); },
          onError: (err) => toast.error(`Failed: ${err.message}`),
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => { toast.success('Product created'); setDialogOpen(false); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      });
    }
  };

  const handleDelete = (id: bigint, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success('Product deleted'),
      onError: () => toast.error('Failed to delete product'),
    });
  };

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const removeSpec = (idx: number) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));
  const updateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setForm(f => ({
      ...f,
      specifications: f.specifications.map((s, i) => i === idx ? { ...s, [field]: val } : s),
    }));
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Loading products...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Products ({products.length})</h3>
        <Button size="sm" onClick={openAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id.toString()}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${(Number(product.price) / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > BigInt(0) ? 'default' : 'destructive'} className="text-xs">
                      {product.stock.toString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  list="categories-list"
                  placeholder="e.g. indoor-plants"
                  required
                />
                <datalist id="categories-list">
                  {categories.map(c => <option key={c.id.toString()} value={c.name} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Image URLs <span className="text-xs text-muted-foreground">(one per line — Cloudinary-ready)</span></Label>
              <Textarea
                value={form.images}
                onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                rows={3}
                placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Variants <span className="text-xs text-muted-foreground">(one per line, e.g. Small, Medium, Large)</span></Label>
              <Textarea value={form.variants} onChange={e => setForm(f => ({ ...f, variants: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Specifications <span className="text-xs text-muted-foreground">(dynamic key-value)</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              {form.specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Key (e.g. Sunlight)"
                    value={spec.key}
                    onChange={e => updateSpec(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g. Indirect)"
                    value={spec.value}
                    onChange={e => updateSpec(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeSpec(idx)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {createProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
