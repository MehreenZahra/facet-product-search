"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilters } from "@/hooks/useFilters";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { ProductCardSkeleton } from "@/components/ProductCard";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Filter,
  X,
  PackageX,
  AlertCircle,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

interface ProductsResult {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Active filter pill ────────────────────────────────────────────────────────

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  );
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<ProductsResult | null>(null);
  const {
    state,
    setQ,
    setVendors,
    setCategories,
    setMinPrice,
    setMaxPrice,
    setInStock,
    setSort,
    setPage,
    clearAll,
  } = useFilters();
  const [loading, setLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const debouncedQuery = useDebounce(state.q, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcut: press "/" to focus search ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsPlaceholder(true);
    const searchParams = new URLSearchParams();

    if (debouncedQuery.trim()) searchParams.set("q", debouncedQuery);
    if (state.sort && state.sort !== "relevance")
      searchParams.set("sort", state.sort);
    state.vendors.forEach((v) => searchParams.append("vendors", v));
    state.categories.forEach((c) => searchParams.append("categories", c));
    if (state.minPrice !== undefined)
      searchParams.set("minPrice", String(state.minPrice));
    if (state.maxPrice !== undefined)
      searchParams.set("maxPrice", String(state.maxPrice));
    if (state.inStock) searchParams.set("inStock", "true");
    searchParams.set("page", String(state.page));
    searchParams.set("pageSize", String(PAGE_SIZE));

    setIsError(false);

    fetch(`/api/products?${searchParams}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        setResult(data);
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setLoading(false);
      })
      .finally(() => setIsPlaceholder(false));
  }, [
    debouncedQuery,
    state.sort,
    state.page,
    state.vendors,
    state.categories,
    state.minPrice,
    state.maxPrice,
    state.inStock,
    retryKey,
  ]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount =
    state.vendors.length +
    state.categories.length +
    (state.inStock ? 1 : 0) +
    (state.minPrice !== undefined ? 1 : 0) +
    (state.maxPrice !== undefined ? 1 : 0);

  const hasActive = activeFilterCount > 0 || !!debouncedQuery;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-6 space-y-1">
          {/* Search */}
          <div className="mb-5">
            <SearchBar
              value={state.q}
              onChange={setQ}
              inputRef={searchInputRef}
            />
          </div>

          {/* Filter header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-primary text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {hasActive && (
              <button
                onClick={clearAll}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-border">
              {state.inStock && (
                <FilterPill
                  label="In Stock"
                  onRemove={() => setInStock(undefined)}
                />
              )}
              {state.vendors.map((v) => (
                <FilterPill
                  key={v}
                  label={v}
                  onRemove={() =>
                    setVendors(state.vendors.filter((i) => i !== v))
                  }
                />
              ))}
              {state.categories.map((c) => (
                <FilterPill
                  key={c}
                  label={c}
                  onRemove={() =>
                    setCategories(state.categories.filter((i) => i !== c))
                  }
                />
              ))}
              {state.minPrice !== undefined && (
                <FilterPill
                  label={`Min £${state.minPrice}`}
                  onRemove={() => setMinPrice(undefined)}
                />
              )}
              {state.maxPrice !== undefined && (
                <FilterPill
                  label={`Max £${state.maxPrice}`}
                  onRemove={() => setMaxPrice(undefined)}
                />
              )}
            </div>
          )}

          {/* Filter panel */}
          <FilterPanel
            selectedVendors={state.vendors}
            setSelectedVendors={setVendors}
            selectedCategories={state.categories}
            setSelectedCategories={setCategories}
            minPrice={state.minPrice}
            setMinPrice={setMinPrice}
            maxPrice={state.maxPrice}
            setMaxPrice={setMaxPrice}
            inStock={state.inStock}
            setInStock={setInStock}
          />
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col min-w-0">
        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Failed to load catalog
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              There was a problem communicating with the server. Please try
              again.
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setLoading(true);
                setIsError(false);
                setRetryKey((k) => k + 1);
              }}
              data-testid="button-retry"
            >
              <RefreshCcw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                {loading && !result ? (
                  <Skeleton className="h-6 w-36" />
                ) : result ? (
                  <h2 className="text-base font-semibold text-foreground tabular-nums">
                    {result.total.toLocaleString()} result
                    {result.total !== 1 ? "s" : ""}
                  </h2>
                ) : null}
                {isPlaceholder && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Updating…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                <SortSelect value={state.sort} onChange={(v) => setSort(v)} />
              </div>
            </div>

            {/* Grid */}
            {loading && !result ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed border-border">
                <PackageX className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No products found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  We couldn&apos;t find anything matching your filters. Try
                  adjusting your search or clearing some criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={clearAll}
                  data-testid="button-clear-empty-state"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  searchQuery={debouncedQuery}
                  className={
                    isPlaceholder
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100"
                  }
                />

                {/* Pagination */}
                {result && result.totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                      Page{" "}
                      <span className="font-medium text-foreground">
                        {result.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-foreground">
                        {result.totalPages}
                      </span>{" "}
                      ·{" "}
                      <span className="font-medium text-foreground">
                        {result.total.toLocaleString()}
                      </span>{" "}
                      total
                    </p>
                    <div className="flex gap-2 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(Math.max(1, state.page - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={state.page <= 1}
                        data-testid="button-prev-page"
                        className="gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(Math.min(result.totalPages, state.page + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={state.page >= result.totalPages}
                        data-testid="button-next-page"
                        className="gap-1.5"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-10 w-full mb-6 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
