import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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

function getInitialFilters(): FiltersState {
  if (typeof window === "undefined") {
    return {
      q: "",
      vendors: [],
      categories: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      sort: "relevance",
      page: 1,
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    vendors: params.getAll("vendors"),
    categories: params.getAll("categories"),
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    inStock:
      params.get("inStock") === "true"
        ? true
        : params.get("inStock") === "false"
          ? false
          : undefined,
    sort: (params.get("sort") as FiltersState["sort"]) || "relevance",
    page: params.get("page") ? Math.max(1, Number(params.get("page"))) : 1,
  };
}

export function useFilters() {
  const [q, setQ] = useState<string>(() => getInitialFilters().q);
  const [vendors, setVendors] = useState<string[]>(() => getInitialFilters().vendors);
  const [categories, setCategories] = useState<string[]>(() => getInitialFilters().categories);
  const [minPrice, setMinPrice] = useState<number | undefined>(() => getInitialFilters().minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(() => getInitialFilters().maxPrice);
  const [inStock, setInStock] = useState<boolean | undefined>(() => getInitialFilters().inStock);
  const [sort, setSort] = useState<FiltersState["sort"]>(() => getInitialFilters().sort);
  const [page, setPage] = useState<number>(() => getInitialFilters().page);

  const isInitialized = useRef(false);

  const syncStateFromUrl = useCallback(() => {
    const initial = getInitialFilters();
    setQ(initial.q);
    setVendors(initial.vendors);
    setCategories(initial.categories);
    setMinPrice(initial.minPrice);
    setMaxPrice(initial.maxPrice);
    setInStock(initial.inStock);
    setSort(initial.sort);
    setPage(initial.page);
  }, []);

  // Mark initialized & listen to browser back/forward (popstate)
  useEffect(() => {
    isInitialized.current = true;
    syncStateFromUrl();

    const handlePopState = () => {
      syncStateFromUrl();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncStateFromUrl]);

  // Sync state to URL (only AFTER initialization!)
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized.current) return;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (vendors.length) vendors.forEach((v) => params.append("vendors", v));
    if (categories.length)
      categories.forEach((c) => params.append("categories", c));
    if (minPrice !== undefined) params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
    if (inStock !== undefined) params.set("inStock", String(inStock));
    if (sort && sort !== "relevance") params.set("sort", sort);
    if (page && page !== 1) params.set("page", String(page));

    const queryStr = params.toString();
    const newUrl = queryStr
      ? `${window.location.pathname}?${queryStr}`
      : window.location.pathname;

    const currentFullUrl = `${window.location.pathname}${window.location.search}`;
    if (currentFullUrl !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [q, vendors, categories, minPrice, maxPrice, inStock, sort, page]);

  const state = useMemo<FiltersState>(
    () => ({
      q,
      vendors,
      categories,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
    }),
    [q, vendors, categories, minPrice, maxPrice, inStock, sort, page],
  );

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
  };
}
