"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilters } from "@/hooks/useFilters";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Product } from "@/types/product";

const PAGE_SIZE = 20;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const {
    state,
    setQ,
    setVendors,
    setCategories,
    setTags,
    setMinPrice,
    setMaxPrice,
    setInStock,
    setSort,
    setPage,
  } = useFilters();
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedQuery = useDebounce(state.q, 300);

  useEffect(() => {
    // reset to first page when query or filters change
    setPage(1);
  }, [
    debouncedQuery,
    state.sort,
    state.vendors,
    state.categories,
    state.tags,
    state.minPrice,
    state.maxPrice,
    state.inStock,
    setPage,
  ]);

  useEffect(() => {
    setLoading(true);
    const searchParams = new URLSearchParams();

    if (debouncedQuery.trim() !== "") {
      searchParams.set("q", debouncedQuery);
    }

    if (state.sort && state.sort !== "relevance") {
      searchParams.set("sort", state.sort);
    }

    if (state.vendors.length > 0) {
      state.vendors.forEach((v) => searchParams.append("vendors", v));
    }

    if (state.categories.length > 0) {
      state.categories.forEach((c) => searchParams.append("categories", c));
    }

    if (state.tags.length > 0) {
      state.tags.forEach((t) => searchParams.append("tags", t));
    }

    if (state.minPrice !== undefined)
      searchParams.set("minPrice", String(state.minPrice));
    if (state.maxPrice !== undefined)
      searchParams.set("maxPrice", String(state.maxPrice));
    if (state.inStock !== undefined)
      searchParams.set("inStock", String(state.inStock));

    searchParams.set("page", String(state.page));
    searchParams.set("pageSize", String(PAGE_SIZE));

    fetch(`/api/products?${searchParams.toString()}`)
      .then((response) => response.json())
      .then((result) => {
        setProducts(result.data || []);
        setTotalPages(result.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [
    debouncedQuery,
    state.sort,
    state.page,
    state.vendors,
    state.categories,
    state.tags,
    state.minPrice,
    state.maxPrice,
    state.inStock,
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Healf
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Wellness product search
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Search the Healf catalogue with filters, sorting, and pagination
            powered by the product API.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <SearchBar value={state.q} onChange={setQ} />
            <SortSelect value={state.sort} onChange={(v) => setSort(v)} />
            <hr className="my-4 border-t border-zinc-100" />
            <FilterPanel
              selectedVendors={state.vendors}
              setSelectedVendors={setVendors}
              selectedCategories={state.categories}
              setSelectedCategories={setCategories}
              selectedTags={state.tags}
              setSelectedTags={setTags}
              minPrice={state.minPrice}
              setMinPrice={setMinPrice}
              maxPrice={state.maxPrice}
              setMaxPrice={setMaxPrice}
              inStock={state.inStock}
              setInStock={setInStock}
            />
          </aside>

          <section className="space-y-6">
            {loading ? (
              <LoadingState />
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <ProductGrid products={products} />
            )}
            <Pagination
              page={state.page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
