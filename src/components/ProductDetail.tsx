"use client";

import React from "react";
import { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
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

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.title}
                className="max-h-96 w-full object-contain"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center">
                <span
                  className="inline-flex h-28 w-28 items-center justify-center rounded-full text-2xl font-semibold text-white"
                  style={{ backgroundColor: vendorColor(product.vendor) }}
                >
                  {product.title
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">
                {product.vendor}
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                £{product.price.toFixed(2)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {product.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {product.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              {product.metafields?.ingredients && (
                <div>
                  <h3 className="mb-1 font-semibold">Ingredients</h3>
                  <p>{product.metafields.ingredients}</p>
                </div>
              )}

              {product.metafields?.suggestedUse && (
                <div>
                  <h3 className="mb-1 font-semibold">Suggested use</h3>
                  <p>{product.metafields.suggestedUse}</p>
                </div>
              )}

              <div>
                <h3 className="mb-1 font-semibold">Inventory</h3>
                <p>
                  {product.inventory > 0
                    ? `${product.inventory} in stock`
                    : "Out of stock"}
                </p>
              </div>

              {product.onlineStoreUrl && (
                <div>
                  <a
                    href={product.onlineStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 underline"
                  >
                    View on store
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Full description</h2>
        {product.bodyHtml ? (
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
          />
        ) : (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            No additional description available.
          </p>
        )}
      </div>
    </div>
  );
}
