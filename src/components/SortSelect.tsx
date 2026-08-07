"use client";

interface SortSelectProps {
  value: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  onChange: (value: SortSelectProps["value"]) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      Sort by
      <select
        className="mt-2 block w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-300 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-900"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as SortSelectProps["value"])
        }
      >
        <option value="relevance">Relevance</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A–Z</option>
        <option value="name_desc">Name: Z–A</option>
      </select>
    </label>
  );
}
