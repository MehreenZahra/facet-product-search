"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Building2,
  Layers,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
          <Switch
            id="available-only"
            checked={!!inStock}
            onCheckedChange={(checked) => setInStock(checked ? true : undefined)}
            data-testid="switch-available"
          />
        </div>
      </FilterSection>

      <Separator />

      {/* Price range */}
      <FilterSection icon={<CircleDollarSign className="w-3.5 h-3.5" />} title="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice(e.target.value === "" ? undefined : Number(e.target.value))}
              className="pl-6 h-8 text-sm"
              data-testid="input-min-price"
            />
          </div>
          <span className="text-muted-foreground text-xs font-medium">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(e.target.value === "" ? undefined : Number(e.target.value))}
              className="pl-6 h-8 text-sm"
              data-testid="input-max-price"
            />
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Brands */}
      <FilterSection
        icon={<Building2 className="w-3.5 h-3.5" />}
        title={`Brands${selectedVendors.length > 0 ? ` (${selectedVendors.length})` : ""}`}
      >
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {vendors === null
            ? Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full rounded-md my-0.5" />
              ))
            : vendors.map((v) => {
                const isChecked = selectedVendors.includes(v.name);
                return (
                  <label
                    key={v.name}
                    htmlFor={`vendor-${v.name}`}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none group",
                      isChecked
                        ? "bg-primary/8 text-primary"
                        : "hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    <Checkbox
                      id={`vendor-${v.name}`}
                      checked={isChecked}
                      onCheckedChange={() => toggle(selectedVendors, setSelectedVendors, v.name)}
                      className={cn(
                        "shrink-0 h-3.5 w-3.5",
                        isChecked ? "border-primary" : "border-muted-foreground/50"
                      )}
                      data-testid={`checkbox-vendor-${v.name}`}
                    />
                    <span className="text-sm leading-none flex-1 truncate" title={v.name}>{v.name}</span>
                    {v.count > 0 && (
                      <span className={cn("text-[11px] tabular-nums shrink-0", isChecked ? "text-primary/70" : "text-muted-foreground")}>
                        {v.count}
                      </span>
                    )}
                  </label>
                );
              })}
        </div>
      </FilterSection>

      <Separator />

      {/* Categories */}
      <FilterSection
        icon={<Layers className="w-3.5 h-3.5" />}
        title={`Categories${selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}`}
      >
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {categories === null
            ? Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full rounded-md my-0.5" />
              ))
            : categories.map((c) => {
                const isChecked = selectedCategories.includes(c.name);
                return (
                  <label
                    key={c.name}
                    htmlFor={`category-${c.name}`}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none group",
                      isChecked
                        ? "bg-primary/8 text-primary"
                        : "hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    <Checkbox
                      id={`category-${c.name}`}
                      checked={isChecked}
                      onCheckedChange={() => toggle(selectedCategories, setSelectedCategories, c.name)}
                      className={cn(
                        "shrink-0 h-3.5 w-3.5",
                        isChecked ? "border-primary" : "border-muted-foreground/50"
                      )}
                      data-testid={`checkbox-category-${c.name}`}
                    />
                    <span className="text-sm leading-none flex-1 truncate" title={c.name}>{c.name}</span>
                    {c.count > 0 && (
                      <span className={cn("text-[11px] tabular-nums shrink-0", isChecked ? "text-primary/70" : "text-muted-foreground")}>
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
