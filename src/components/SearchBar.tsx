"use client";

import { SearchInput } from "@/components/ui/search-input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <SearchInput
      ref={inputRef}
      id="search-input"
      type="search"
      placeholder="Search catalog… (/)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="input-search"
    />
  );
}
