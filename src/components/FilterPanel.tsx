"use client";

import { useEffect, useState } from "react";

interface FilterPanelProps {
  selectedVendors: string[];
  setSelectedVendors: (v: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (c: string[]) => void;
  minPrice: number | undefined;
  setMinPrice: (n: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (n: number | undefined) => void;
  inStock: boolean | undefined;
  setInStock: (b: boolean | undefined) => void;
}

export function FilterPanel({
  selectedVendors,
  setSelectedVendors,
  selectedCategories,
  setSelectedCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStock,
  setInStock,
}: FilterPanelProps) {
  const [vendors, setVendors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products/vendors")
      .then((r) => r.json())
      .then(setVendors)
      .catch(() => setVendors([]));

    fetch("/api/products/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function toggleItem(
    list: string[],
    setList: (s: string[]) => void,
    item: string,
  ) {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Vendors</h3>
        <div className="max-h-40 overflow-auto">
          {vendors.map((v) => (
            <label key={v} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={selectedVendors.includes(v)}
                onChange={() =>
                  toggleItem(selectedVendors, setSelectedVendors, v)
                }
              />
              <span className="truncate">{v}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
        <div className="max-h-40 overflow-auto">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c)}
                onChange={() =>
                  toggleItem(selectedCategories, setSelectedCategories, c)
                }
              />
              <span className="truncate">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Price</h3>
        <div className="flex gap-2">
          <input
            className="w-1/2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Min"
            type="number"
            value={minPrice ?? ""}
            onChange={(e) =>
              setMinPrice(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
          <input
            className="w-1/2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Max"
            type="number"
            value={maxPrice ?? ""}
            onChange={(e) =>
              setMaxPrice(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Availability</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!inStock}
            onChange={(e) => setInStock(e.target.checked ? true : undefined)}
          />
          <span className="text-sm">In stock only</span>
        </label>
      </div>

      <div className="pt-2">
        <button
          className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setSelectedVendors([]);
            setSelectedCategories([]);
            setMinPrice(undefined);
            setMaxPrice(undefined);
            setInStock(undefined);
          }}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
