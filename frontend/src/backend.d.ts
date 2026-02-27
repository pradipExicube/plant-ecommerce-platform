import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
}
export interface CreateCategoryPayload {
    name: string;
    slug: string;
    parentCategory?: bigint;
}
export interface Category {
    id: bigint;
    name: string;
    slug: string;
    parentCategory?: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Address {
    id: bigint;
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export interface WishlistItem {
    productId: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface CreateProductPayload {
    specifications: Array<[string, string]>;
    name: string;
    slug: string;
    description: string;
    variants: Array<string>;
    stock: bigint;
    category: string;
    price: bigint;
    images: Array<string>;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Cart {
    items: Array<CartItem>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Review {
    userId: Principal;
    productId: bigint;
    comment: string;
    rating: bigint;
}
export interface Product {
    id: bigint;
    specifications: Array<[string, string]>;
    name: string;
    slug: string;
    description: string;
    variants: Array<string>;
    stock: bigint;
    category: string;
    price: bigint;
    images: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAddress(address: Address): Promise<bigint>;
    addReview(productId: bigint, rating: bigint, comment: string): Promise<void>;
    addToWishlist(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCategory(payload: CreateCategoryPayload): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(payload: CreateProductPayload): Promise<void>;
    deleteAddress(addressId: bigint): Promise<void>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    deleteReview(productId: bigint, reviewerPrincipal: Principal): Promise<void>;
    getAddresses(): Promise<Array<Address>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCategories(): Promise<Array<Category>>;
    getProductBySlug(slug: string): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(categoryName: string): Promise<Array<Product>>;
    getProductsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getReviews(productId: bigint): Promise<Array<Review>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWishlist(): Promise<Array<WishlistItem>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    removeFromWishlist(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<Product>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAddress(updated: Address): Promise<void>;
    updateCart(cart: Cart): Promise<void>;
    updateCategory(payload: Category): Promise<void>;
    updateProduct(payload: Product): Promise<void>;
}
