"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/product";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
  Tag,
  Layers,
  Clock,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage(props: PageProps) {
  const params = use(props.params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { recentProducts, addProduct } = useRecentlyViewed();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        addProduct(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6"><Skeleton className="h-4 w-32" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find the product you&apos;re looking for. It may have been removed or the ID is incorrect.
        </p>
        <Link href="/">
          <Button>Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const inStock = product.inventory > 0;
  const filteredRecent = recentProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col gap-12">

      {/* Back link */}
      <nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-primary -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Search
        </Button>
      </nav>

      {/* Main product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

        {/* Image */}
        <div className="bg-secondary rounded-2xl aspect-square flex items-center justify-center overflow-hidden border border-border">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-6"
            />
          ) : (
            <Package className="w-24 h-24 text-muted-foreground/30" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Vendor badge */}
          <div className="mb-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px]">
              {product.vendor}
            </Badge>
          </div>

          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground mb-4">
            {product.title}
          </h1>

          <div className="text-3xl font-semibold text-primary mb-6">
            {formatCurrency(product.price)}
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {inStock ? (
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-md">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> In Stock ({product.inventory} available)
              </div>
            ) : (
              <div className="flex items-center text-sm font-medium text-destructive bg-destructive/10 px-3 py-1.5 rounded-md">
                <XCircle className="w-4 h-4 mr-1.5" /> Out of Stock
              </div>
            )}
            {product.category && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Layers className="w-4 h-4 mr-1.5" /> {product.category}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-8">
            <p className="leading-relaxed">{product.description}</p>
          </div>

          {/* Metafields */}
          {product.metafields?.ingredients && (
            <div className="mb-4 text-sm">
              <h3 className="font-semibold text-foreground mb-1">Ingredients</h3>
              <p className="text-muted-foreground">{product.metafields.ingredients}</p>
            </div>
          )}
          {product.metafields?.suggestedUse && (
            <div className="mb-4 text-sm">
              <h3 className="font-semibold text-foreground mb-1">Suggested Use</h3>
              <p className="text-muted-foreground">{product.metafields.suggestedUse}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Attributes
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta */}
          <div className="mt-auto pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Added {new Date(product.createdAt).toLocaleDateString()}
            </div>
            {product.onlineStoreUrl && product.onlineStoreUrl !== "NONE" && (
              <a
                href={product.onlineStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
              >
                View on Healf <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Full HTML description */}
      {product.bodyHtml && (
        <section className="pt-8">
          <Separator className="mb-8" />
          <h2 className="text-xl font-display font-semibold mb-6">Full Description</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
          />
        </section>
      )}

      {/* Recently Viewed */}
      {filteredRecent.length > 0 && (
        <section className="pt-8">
          <Separator className="mb-8" />
          <h2 className="text-xl font-display font-semibold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRecent.map((recent) => (
              <ProductCard key={recent.id} product={recent} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
