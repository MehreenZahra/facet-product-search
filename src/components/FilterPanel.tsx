"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Building2,
  Tag,
} from "lucide-react";

interface FilterPanelProps {
  selectedVendors: string[];
  setSelectedVendors: (v: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (c: string[]) => void;
  selectedTags?: string[];
  setSelectedTags?: (t: string[]) => void;
  minPrice: number | undefined;
  setMinPrice: (n: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (n: number | undefined) => void;
  inStock: boolean | undefined;
  setInStock: (b: boolean | undefined) => void;
}

function FilterSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-primary/70">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
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
  const [vendors, setVendors] = useState<{ name: string; count: number }[] | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[] | null>(null);

  useEffect(() => {
    fetch("/api/products/vendors")
      .then((r) => r.json())
      .then((data: string[] | { vendor: string; count: number }[]) => {
        // Handle both plain string[] and {vendor,count}[] responses
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
          setVendors((data as string[]).map((v) => ({ name: v, count: 0 })));
        } else {
          setVendors(
            (data as { vendor: string; count: number }[]).map((v) => ({
              name: v.vendor,
              count: v.count ?? 0,
            }))
          );
        }
      })
      .catch(() => setVendors([]));

    fetch("/api/products/categories")
      .then((r) => r.json())
      .then((data: string[] | { category: string; count: number }[]) => {
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
          setCategories((data as string[]).map((c) => ({ name: c, count: 0 })));
        } else {
          setCategories(
            (data as { category: string; count: number }[]).map((c) => ({
              name: c.category,
              count: c.count ?? 0,
            }))
          );
        }
      })
      .catch(() => setCategories([]));
  }, []);

  function toggle(list: string[], setList: (s: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  return (
    <div className="space-y-6">

      {/* Availability */}
      <FilterSection icon={<CheckCircle2 className="w-3.5 h-3.5" />} title="Availability">
        <div className="flex items-center justify-between py-1">
          <label htmlFor="available-only" className="text-sm font-medium cursor-pointer select-none">
            In Stock Only
          </label>
          {/* Toggle switch */}
          <button
            id="available-only"
            type="button"
            role="switch"
            aria-checked={!!inStock}
            onClick={() => setInStock(inStock ? undefined : true)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              inStock ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                inStock ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Price range */}
      <FilterSection icon={<CircleDollarSign className="w-3.5 h-3.5" />} title="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice(e.target.value === "" ? undefined : Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background pl-6 pr-2 py-1.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              data-testid="input-min-price"
            />
          </div>
          <span className="text-muted-foreground text-xs font-medium">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(e.target.value === "" ? undefined : Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background pl-6 pr-2 py-1.5 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              data-testid="input-max-price"
            />
          </div>
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Brands */}
      <FilterSection
        icon={<Building2 className="w-3.5 h-3.5" />}
        title={`Brands${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ""}`}
      >
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {vendors === null
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-7 w-full rounded-md bg-muted animate-pulse my-0.5" />
              ))
            : vendors.map((v) => {
                const checked = selectedVendors.includes(v.name);
                return (
                  <label
                    key={v.name}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none ${
                      checked ? "bg-primary/8 text-primary" : "hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-muted-foreground/50 text-primary shrink-0"
                      checked={checked}
                      onChange={() => toggle(selectedVendors, setSelectedVendors, v.name)}
                      data-testid={`checkbox-vendor-${v.name}`}
                    />
                    <span className="text-sm leading-none flex-1 truncate" title={v.name}>{v.name}</span>
                    {v.count > 0 && (
                      <span className={`text-[11px] tabular-nums shrink-0 ${checked ? "text-primary/70" : "text-muted-foreground"}`}>
                        {v.count}
                      </span>
                    )}
                  </label>
                );
              })}
        </div>
      </FilterSection>

      <hr className="border-border" />

      {/* Categories */}
      <FilterSection
        icon={<Tag className="w-3.5 h-3.5" />}
        title={`Categories${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}`}
      >
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {categories === null
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-7 w-full rounded-md bg-muted animate-pulse my-0.5" />
              ))
            : categories.map((c) => {
                const checked = selectedCategories.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none ${
                      checked ? "bg-primary/8 text-primary" : "hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-muted-foreground/50 text-primary shrink-0"
                      checked={checked}
                      onChange={() => toggle(selectedCategories, setSelectedCategories, c.name)}
                      data-testid={`checkbox-category-${c.name}`}
                    />
                    <span className="text-sm leading-none flex-1 truncate" title={c.name}>{c.name}</span>
                    {c.count > 0 && (
                      <span className={`text-[11px] tabular-nums shrink-0 ${checked ? "text-primary/70" : "text-muted-foreground"}`}>
                        {c.count}
                      </span>
                    )}
                  </label>
                );
              })}
        </div>
      </FilterSection>
    </div>
  );
}
