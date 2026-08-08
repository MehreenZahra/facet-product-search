"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type FiltersState = {
  q: string;
  vendors: string[];
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  page: number;
};

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Derive filter state directly from URL searchParams (single source of truth!)
  const state = useMemo<FiltersState>(() => {
    const q = searchParams.get("q") || "";
    const vendors = searchParams.getAll("vendors");
    const categories = searchParams.getAll("categories");
    const minParam = searchParams.get("minPrice");
    const maxParam = searchParams.get("maxPrice");
    const inStockParam = searchParams.get("inStock");
    const sortParam = searchParams.get("sort") as FiltersState["sort"] | null;
    const pageParam = searchParams.get("page");

    return {
      q,
      vendors,
      categories,
      minPrice: minParam ? Number(minParam) : undefined,
      maxPrice: maxParam ? Number(maxParam) : undefined,
      inStock:
        inStockParam === "true"
          ? true
          : inStockParam === "false"
            ? false
            : undefined,
      sort: sortParam || "relevance",
      page: pageParam ? Math.max(1, Number(pageParam)) : 1,
    };
  }, [searchParams]);

  // 2. Update URL parameters using Next.js App Router
  const updateFilters = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const setQ = useCallback(
    (q: string) => {
      updateFilters((params) => {
        if (q.trim()) params.set("q", q);
        else params.delete("q");
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setVendors = useCallback(
    (vendors: string[]) => {
      updateFilters((params) => {
        params.delete("vendors");
        vendors.forEach((v) => params.append("vendors", v));
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setCategories = useCallback(
    (categories: string[]) => {
      updateFilters((params) => {
        params.delete("categories");
        categories.forEach((c) => params.append("categories", c));
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setMinPrice = useCallback(
    (minPrice: number | undefined) => {
      updateFilters((params) => {
        if (minPrice !== undefined) params.set("minPrice", String(minPrice));
        else params.delete("minPrice");
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setMaxPrice = useCallback(
    (maxPrice: number | undefined) => {
      updateFilters((params) => {
        if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
        else params.delete("maxPrice");
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setInStock = useCallback(
    (inStock: boolean | undefined) => {
      updateFilters((params) => {
        if (inStock !== undefined) params.set("inStock", String(inStock));
        else params.delete("inStock");
        params.delete("page");
      });
    },
    [updateFilters],
  );

  const setSort = useCallback(
    (sort: FiltersState["sort"]) => {
      updateFilters((params) => {
        if (sort && sort !== "relevance") params.set("sort", sort);
        else params.delete("sort");
      });
    },
    [updateFilters],
  );

  const setPage = useCallback(
    (page: number) => {
      updateFilters((params) => {
        if (page > 1) params.set("page", String(page));
        else params.delete("page");
      });
    },
    [updateFilters],
  );
  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);
  return {
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
  };
}
