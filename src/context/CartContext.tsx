import React, { createContext, useContext, useState, useMemo } from "react";
import { Product, CartItem, Customer } from "../types";

interface CartContextType {
  cart: CartItem[];
  customer: Customer | null;
  discount: number;
  discountType: "fixed" | "percentage";
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updatePrice: (productId: number, customPrice: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (amount: number, type?: "fixed" | "percentage") => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discount, setDiscountState] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, customPrice: Number(product.selling_price) }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updatePrice = (productId: number, customPrice: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, customPrice } : item
      )
    );
  };

  const setDiscount = (amount: number, type: "fixed" | "percentage" = "fixed") => {
    setDiscountState(Math.max(0, amount));
    setDiscountType(type);
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscountState(0);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : Number(item.product.selling_price);
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (subtotal * Math.min(100, discount)) / 100;
    }
    return Math.min(subtotal, discount);
  }, [subtotal, discount, discountType]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const itemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        customer,
        discount,
        discountType,
        addToCart,
        removeFromCart,
        updateQuantity,
        updatePrice,
        setCustomer,
        setDiscount,
        clearCart,
        subtotal,
        discountAmount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
