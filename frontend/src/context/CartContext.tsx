import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, Variant } from '../types/Product';
import { useContext as useReactContext } from 'react';
import { AuthContext } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  variant: Variant;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, variant: Variant) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useReactContext(AuthContext);
  const userId = user?._id || 'guest';

  const getCartKey = () => `cart_${userId}`;

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(getCartKey());
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }, [cart, userId]);

  const addToCart = (product: Product, color: string, size: string, variant: Variant) => {
    setCart(prev => {
      const existing = prev.find(
        item =>
          item.product._id === product._id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      const maxQuantity = variant.quantity || 99;

      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > maxQuantity) return prev;
        return prev.map(item =>
          item.product._id === product._id &&
          item.selectedColor === color &&
          item.selectedSize === size
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prev, { product, quantity: 1, selectedColor: color, selectedSize: size, variant }];
    });
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    setCart(prev =>
      prev.filter(
        item =>
          !(item.product._id === productId &&
            item.selectedColor === color &&
            item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
  setCart(prev =>
    prev.map(item => {
      if (
        item.product._id === productId &&
        item.selectedColor === color &&
        item.selectedSize === size
      ) {
        const max = item.variant.quantity ?? 99;
        const safeQuantity = Math.max(1, Math.min(quantity, max));
        return {
          ...item,
          quantity: safeQuantity,
        };
      }
      return item;
    })
  );
};

  const clearCart = () => {
    localStorage.removeItem(getCartKey());
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
