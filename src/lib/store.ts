"use client";

import { useState, useEffect } from "react";
import { CartItem, FulfilmentType } from "@/types";

const CART_STORAGE_KEY = "oe_cart_state_v1";

export interface CartState {
  items: CartItem[];
  fulfilmentType: FulfilmentType;
  tableNumber: string;
  couponCode: string;
  addItem: (item: Omit<CartItem, "id" | "totalPrice">) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setFulfilmentType: (type: FulfilmentType) => void;
  setTableNumber: (table: string) => void;
  setCouponCode: (code: string) => void;
}

// Simple pub-sub store so multiple client components stay in sync without extra heavy state libraries
let globalCartState: {
  items: CartItem[];
  fulfilmentType: FulfilmentType;
  tableNumber: string;
  couponCode: string;
} = {
  items: [],
  fulfilmentType: "PICKUP",
  tableNumber: "",
  couponCode: "",
};

const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(globalCartState));
    } catch {
      // ignore storage error
    }
  }
  listeners.forEach((l) => l());
}

export function useCart() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Load initial cart from localStorage on client mount
    if (typeof window !== "undefined" && globalCartState.items.length === 0) {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          globalCartState = {
            ...globalCartState,
            ...parsed,
          };
        }
      } catch {
        // ignore parsing error
      }
    }

    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addItem = (item: Omit<CartItem, "id" | "totalPrice">) => {
    // Generate unique key based on item id and selected option value ids
    const optionKey = (item.selectedOptions || [])
      .map((o) => o.valueId)
      .sort()
      .join("-");
    const id = `${item.menuItemId}_${optionKey}`;

    const existingIndex = globalCartState.items.findIndex((i) => i.id === id);
    if (existingIndex > -1) {
      const existing = globalCartState.items[existingIndex];
      const newQty = existing.quantity + item.quantity;
      globalCartState.items[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: newQty * existing.unitPrice,
      };
    } else {
      globalCartState.items.push({
        ...item,
        id,
        totalPrice: item.unitPrice * item.quantity,
      });
    }
    notify();
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    const existing = globalCartState.items.find((i) => i.id === cartItemId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      globalCartState.items = globalCartState.items.filter((i) => i.id !== cartItemId);
    } else {
      existing.quantity = newQty;
      existing.totalPrice = newQty * existing.unitPrice;
    }
    notify();
  };

  const removeItem = (cartItemId: string) => {
    globalCartState.items = globalCartState.items.filter((i) => i.id !== cartItemId);
    notify();
  };

  const clearCart = () => {
    globalCartState.items = [];
    globalCartState.couponCode = "";
    notify();
  };

  const setFulfilmentType = (type: FulfilmentType) => {
    globalCartState.fulfilmentType = type;
    notify();
  };

  const setTableNumber = (table: string) => {
    globalCartState.tableNumber = table;
    notify();
  };

  const setCouponCode = (code: string) => {
    globalCartState.couponCode = code;
    notify();
  };

  const totalItemCount = globalCartState.items.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = globalCartState.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    items: globalCartState.items,
    fulfilmentType: globalCartState.fulfilmentType,
    tableNumber: globalCartState.tableNumber,
    couponCode: globalCartState.couponCode,
    totalItemCount,
    rawSubtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setFulfilmentType,
    setTableNumber,
    setCouponCode,
  };
}
