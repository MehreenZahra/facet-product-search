"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/product";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  searchQuery?: string;
}

function ProductImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-secondary select-none">
        <Package className="w-10 h-10 opacity-25" />
        <span className="text-[11px] opacity-40 font-medium tracking-wide">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function ProductCard({ product, searchQuery = "" }: ProductCardProps) {
  const isOutOfStock = product.inventory <= 0;
  const displayTags = product.tags.slice(0, 3);
  const extraTags = product.tags.length - 3;

  return (
    <Card className="overflow-hidden flex flex-col group hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
      {/* Image area */}
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-secondary"
        aria-label={`View ${product.title}`}
      >
        <ProductImage src={product.imageUrl} alt={product.title} />

        {/* Out-of-stock badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="font-semibold text-[11px] shadow-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      {/* Card body */}
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.id}`} className="hover:underline outline-none focus-visible:underline min-w-0">
            <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
              {product.title}
            </h3>
          </Link>
          <div className="font-bold whitespace-nowrap text-primary shrink-0 text-sm mt-0.5">
            {formatCurrency(product.price)}
          </div>
        </div>

        {/* Vendor + category */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate font-medium">{product.vendor}</span>
          {product.category && (
            <>
              <span className="mx-0.5 opacity-50">·</span>
              <span className="truncate">{product.category}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="mt-auto pt-3 flex flex-wrap gap-1">
            {displayTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {tag}
              </Badge>
            ))}
            {extraTags > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground">
                +{extraTags}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div className="h-5 bg-muted rounded animate-pulse flex-1" />
          <div className="h-5 w-14 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="mt-auto pt-3 flex gap-1.5">
          <div className="h-4 w-10 bg-muted rounded animate-pulse" />
          <div className="h-4 w-14 bg-muted rounded animate-pulse" />
          <div className="h-4 w-10 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
