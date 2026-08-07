"use client";

import { useState } from "react";
import { Product } from "@/types/product";

const KEY = "healf-recently-viewed";
const MAX = 10;

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    } catch {
      return [];
    }
  });

  const addProduct = (product: Product) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch { /* storage quota */ }
      return next;
    });
  };

  return { recentProducts, addProduct };
}
