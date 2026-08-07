"use client";

import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  searchQuery?: string;
  className?: string;
}

export function ProductGrid({ products, searchQuery = "", className = "" }: ProductGridProps) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 transition-opacity duration-200 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
