import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  shopId: string;
  shopName: string;
  stock: number;
}

interface CartStore {
  items: CartProduct[];
  addItem: (item: Omit<CartProduct, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearShopItems: (shopId: string) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      clearShopItems: (shopId) => {
        set({ items: get().items.filter((i) => i.shopId !== shopId) });
      },
    }),
    { name: "sugbu-cart" }
  )
);

export function useCartItemCount(): number {
  return useCart((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartTotal(): number {
  return useCart((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
}
