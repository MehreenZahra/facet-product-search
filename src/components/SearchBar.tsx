"use client";

import { ChangeEvent, forwardRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        ref={inputRef}
        id="search-input"
        className="block w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        type="search"
        placeholder="Search catalog… (/)"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        data-testid="input-search"
      />
    </div>
  );
}
