import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/firestore';

export interface ProductVariant {
  nameAr: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  cartKey: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

function makeCartKey(productId: string, variant?: ProductVariant) {
  return variant ? `${productId}|${variant.nameAr}` : `${productId}`;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variant) => {
        const cartKey = makeCartKey(product.id, variant);
        set((state) => {
          const existingItem = state.items.find((item) => item.cartKey === cartKey);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.cartKey === cartKey
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity, variant, cartKey }] };
        });
      },
      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartKey !== cartKey),
        }));
      },
      updateQuantity: (cartKey, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.cartKey !== cartKey) };
          }
          return {
            items: state.items.map((item) =>
              item.cartKey === cartKey ? { ...item, quantity } : item
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.variant ? item.variant.price : item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'lecker-cart-v2',
    }
  )
);
