import { useEffect, useMemo, useState } from "react";

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

function parseArrayParam(val: string | string[] | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(",").filter(Boolean);
}

export function useFilters() {
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStock, setInStock] = useState<boolean | undefined>(undefined);
  const [sort, setSort] = useState<FiltersState["sort"]>("relevance");
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") || "";
    const vendorsParam = params.getAll("vendors");
    const categoriesParam = params.getAll("categories");
    const minParam = params.get("minPrice");
    const maxParam = params.get("maxPrice");
    const inStockParam = params.get("inStock");
    const sortParam = params.get("sort") as FiltersState["sort"] | null;
    const pageParam = params.get("page");

    setQ(qParam);
    setVendors(vendorsParam || []);
    setCategories(categoriesParam || []);
    setMinPrice(minParam ? Number(minParam) : undefined);
    setMaxPrice(maxParam ? Number(maxParam) : undefined);
    setInStock(
      inStockParam === "true"
        ? true
        : inStockParam === "false"
          ? false
          : undefined,
    );
    if (sortParam) setSort(sortParam);
    setPage(pageParam ? Math.max(1, Number(pageParam)) : 1);
  }, []);

  // sync to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
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

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
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
