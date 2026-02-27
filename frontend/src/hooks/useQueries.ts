import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Product,
  Category,
  Cart,
  Address,
  WishlistItem,
  UserProfile,
  CreateProductPayload,
  CreateCategoryPayload,
  ShoppingItem,
  StripeConfiguration,
  Review,
} from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProductBySlug(slug: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProductBySlug(slug);
    },
    enabled: !!actor && !actorFetching && !!slug,
  });
}

export function useGetProductsByCategory(categoryName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByCategory(categoryName);
    },
    enabled: !!actor && !actorFetching && !!categoryName,
  });
}

export function useSearchProducts(searchText: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchText],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(searchText);
    },
    enabled: !!actor && !actorFetching && !!searchText,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Category) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useGetCart() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return { items: [] };
      return actor.getCart();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cart: Cart) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCart(cart);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export function useGetAddresses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAddresses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Address) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAddress(address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Address) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAddress(address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAddress(addressId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useGetWishlist() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWishlist();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddToWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useGetReviews(productId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', productId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews(productId);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: bigint; rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(productId, rating, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId.toString()] });
    },
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}
