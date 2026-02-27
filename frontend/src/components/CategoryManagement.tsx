import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useQueries';
import type { Category, CreateCategoryPayload } from '../backend';
import { toast } from 'sonner';

type FormData = { name: string; slug: string; parentCategory: string };
const emptyForm: FormData = { name: '', slug: '', parentCategory: '' };

export default function CategoryManagement() {
  const { data: categories = [], isLoading } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openAdd = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentCategory: cat.parentCategory?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentCategory: form.parentCategory ? BigInt(form.parentCategory) : undefined,
    };

    if (editingCategory) {
      updateCategory.mutate(
        { ...payload, id: editingCategory.id },
        {
          onSuccess: () => { toast.success('Category updated'); setDialogOpen(false); },
          onError: () => toast.error('Failed to update category'),
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => { toast.success('Category created'); setDialogOpen(false); },
        onError: () => toast.error('Failed to create category'),
      });
    }
  };

  const handleDelete = (id: bigint, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    deleteCategory.mutate(id, {
      onSuccess: () => toast.success('Category deleted'),
      onError: () => toast.error('Failed to delete category'),
    });
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Loading categories...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Categories ({categories.length})</h3>
        <Button size="sm" onClick={openAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No categories yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => {
                const parent = cat.parentCategory
                  ? categories.find(c => c.id === cat.parentCategory)
                  : null;
                return (
                  <TableRow key={cat.id.toString()}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">{cat.slug}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{parent?.name || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cat.id, cat.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-1.5">
              <Label>Parent Category <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.parentCategory}
                onChange={e => setForm(f => ({ ...f, parentCategory: e.target.value }))}
              >
                <option value="">None</option>
                {categories
                  .filter(c => !editingCategory || c.id !== editingCategory.id)
                  .map(c => (
                    <option key={c.id.toString()} value={c.id.toString()}>{c.name}</option>
                  ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
