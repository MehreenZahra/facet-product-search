'use client';

import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

function getInitials(name: string) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'P';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function vendorColor(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative h-56 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-200 text-4xl font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: vendorColor(product.vendor) }}>
              {getInitials(product.title)}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">{product.vendor}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">£{product.price.toFixed(2)}</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{product.title}</h2>
        <p className="line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{product.description}</p>
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
