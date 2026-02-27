import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useUpdateCart } from './useQueries';
import type { CartItem } from '../backend';

const CART_STORAGE_KEY = 'greenleaf-cart';

export interface LocalCartItem {
  productId: bigint;
  quantity: number;
  name: string;
  price: bigint;
  image: string;
  slug: string;
}

interface CartContextType {
  items: LocalCartItem[];
  addItem: (item: Omit<LocalCartItem, 'quantity'>) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: bigint;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function serializeCart(items: LocalCartItem[]): string {
  return JSON.stringify(items.map(item => ({
    ...item,
    productId: item.productId.toString(),
    price: item.price.toString(),
  })));
}

function deserializeCart(raw: string): LocalCartItem[] {
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((item: Record<string, unknown>) => ({
      ...item,
      productId: BigInt(item.productId as string),
      price: BigInt(item.price as string),
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? deserializeCart(stored) : [];
  });

  const { identity } = useInternetIdentity();
  const updateCartMutation = useUpdateCart();

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
  }, [items]);

  // Sync to backend when authenticated
  useEffect(() => {
    if (identity && items.length > 0) {
      const backendCart: { items: CartItem[] } = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: BigInt(item.quantity),
        })),
      };
      updateCartMutation.mutate(backendCart);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, items]);

  const addItem = useCallback((newItem: Omit<LocalCartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === newItem.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: bigint) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev =>
        prev.map(i => i.productId === productId ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * BigInt(i.quantity), BigInt(0));

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
