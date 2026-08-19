"use client";
import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/useDebounce";
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 400);

  // Stay in sync if the value changes from outside (e.g. "Clear all", back navigation)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Only tell the parent once typing has paused
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <SearchInput
      ref={inputRef}
      id="search-input"
      type="search"
      placeholder="Search catalog… (/)"
      value={localValue}
      maxLength={50}
      onChange={(e) => setLocalValue(e.target.value)}
      data-testid="input-search"
    />
  );
}
