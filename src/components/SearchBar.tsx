"use client";

import { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <label
        className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        htmlFor="search"
      >
        Search products
      </label>
      <input
        id="search"
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-300 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-900"
        type="search"
        placeholder="Search by name, brand, tag, or benefit"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}
