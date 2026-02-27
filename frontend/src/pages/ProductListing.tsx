import React, { useState, useMemo } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import ProductCard from '../components/ProductCard';
import { useGetProducts } from '../hooks/useQueries';

const ITEMS_PER_PAGE = 12;
const SUNLIGHT_OPTIONS = ['Any', 'Full Sun', 'Partial Sun', 'Indirect Light', 'Low Light'];
const SIZE_OPTIONS = ['Any', 'Small', 'Medium', 'Large', 'Extra Large'];
const PLANT_TYPES = ['Any', 'Tropical', 'Succulent', 'Fern', 'Flowering', 'Herb', 'Tree'];

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

interface Filters {
  category: string;
  priceRange: [number, number];
  plantType: string;
  sunlight: string;
  size: string;
  search: string;
}

export default function ProductListing() {
  const searchParams = useSearch({ from: '/products' }) as Record<string, string>;
  const navigate = useNavigate({ from: '/products' });

  const { data: allProducts = [], isLoading } = useGetProducts();

  const initialCategory = searchParams.category || '';

  const [filters, setFilters] = useState<Filters>({
    category: initialCategory,
    priceRange: [0, 500],
    plantType: 'Any',
    sunlight: 'Any',
    size: 'Any',
    search: '',
  });
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 500;
    return Math.max(500, Math.ceil(Math.max(...allProducts.map(p => Number(p.price) / 100))));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (filters.category) {
      result = result.filter(p =>
        p.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    result = result.filter(p => {
      const price = Number(p.price) / 100;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
    if (filters.plantType !== 'Any') {
      result = result.filter(p =>
        p.specifications.some(([k, v]) =>
          k.toLowerCase().includes('type') && v.toLowerCase().includes(filters.plantType.toLowerCase())
        ) || p.category.toLowerCase().includes(filters.plantType.toLowerCase())
      );
    }
    if (filters.sunlight !== 'Any') {
      result = result.filter(p =>
        p.specifications.some(([k, v]) =>
          k.toLowerCase().includes('sun') && v.toLowerCase().includes(filters.sunlight.toLowerCase())
        )
      );
    }
    if (filters.size !== 'Any') {
      result = result.filter(p =>
        p.variants.some(v => v.toLowerCase().includes(filters.size.toLowerCase())) ||
        p.specifications.some(([k, v]) =>
          k.toLowerCase().includes('size') && v.toLowerCase().includes(filters.size.toLowerCase())
        )
      );
    }

    if (sort === 'price-asc') result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [allProducts, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const setCategory = (cat: string) => {
    setFilters(f => ({ ...f, category: cat }));
    setPage(1);
    navigate({ search: (prev: Record<string, string>) => ({ ...prev, category: cat }) });
  };

  const clearFilters = () => {
    setFilters({ category: '', priceRange: [0, maxPrice], plantType: 'Any', sunlight: 'Any', size: 'Any', search: '' });
    setPage(1);
    navigate({ search: {} });
  };

  const activeFilterCount = [
    filters.category,
    filters.plantType !== 'Any' ? filters.plantType : '',
    filters.sunlight !== 'Any' ? filters.sunlight : '',
    filters.size !== 'Any' ? filters.size : '',
    filters.search,
  ].filter(Boolean).length;

  const CATEGORY_PILLS = [
    { value: '', label: 'All' },
    { value: 'indoor-plants', label: 'Indoor Plants' },
    { value: 'outdoor-plants', label: 'Outdoor Plants' },
    { value: 'pots', label: 'Pots' },
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Search</Label>
        <Input
          placeholder="Search plants..."
          value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filters.category === cat.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-3 block">
          Price: ${filters.priceRange[0]} – ${filters.priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={5}
          value={filters.priceRange}
          onValueChange={(val) => { setFilters(f => ({ ...f, priceRange: val as [number, number] })); setPage(1); }}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">Plant Type</Label>
        <Select value={filters.plantType} onValueChange={v => { setFilters(f => ({ ...f, plantType: v })); setPage(1); }}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PLANT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">Sunlight</Label>
        <Select value={filters.sunlight} onValueChange={v => { setFilters(f => ({ ...f, sunlight: v })); setPage(1); }}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SUNLIGHT_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">Size</Label>
        <Select value={filters.size} onValueChange={v => { setFilters(f => ({ ...f, size: v })); setPage(1); }}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-1">
          <X className="w-3.5 h-3.5" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold mb-1">All Plants</h1>
        <p className="text-muted-foreground text-sm">
          {isLoading ? 'Loading...' : `${filteredProducts.length} plant${filteredProducts.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {filters.category.replace(/-/g, ' ')}
              <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              "{filters.search}"
              <button onClick={() => setFilters(f => ({ ...f, search: '' }))}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.plantType !== 'Any' && (
            <Badge variant="secondary" className="gap-1">
              {filters.plantType}
              <button onClick={() => setFilters(f => ({ ...f, plantType: 'Any' }))}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.sunlight !== 'Any' && (
            <Badge variant="secondary" className="gap-1">
              {filters.sunlight}
              <button onClick={() => setFilters(f => ({ ...f, sunlight: 'Any' }))}><X className="w-3 h-3" /></button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-card rounded-2xl p-5 shadow-card sticky top-24">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-1">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={v => { setSort(v as SortOption); setPage(1); }}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
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
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="font-display text-xl font-semibold mb-2">No plants found</h3>
              <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={currentPage === p}
                            onClick={() => setPage(p as number)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
