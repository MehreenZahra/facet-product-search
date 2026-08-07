"use client";

interface SortSelectProps {
  value: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  onChange: (value: SortSelectProps["value"]) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      className="h-8 w-44 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring text-foreground"
      value={value}
      onChange={(e) => onChange(e.target.value as SortSelectProps["value"])}
      data-testid="select-sort"
    >
      <option value="relevance">Relevance</option>
      <option value="price_asc">Price: Low → High</option>
      <option value="price_desc">Price: High → Low</option>
      <option value="name_asc">Name: A → Z</option>
      <option value="name_desc">Name: Z → A</option>
    </select>
  );
}
