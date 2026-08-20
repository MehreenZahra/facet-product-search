"use client";
import { useState, useEffect, useRef } from "react";
import { SearchInput } from "@/components/ui/search-input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange; // always fresh, no effect needed to keep it updated

  // Sync when the URL changes from outside (Clear All, back navigation)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChangeRef.current(newValue);
    }, 400);
  };

  // Clean up any pending timer if the component unmounts mid-typing
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <SearchInput
      ref={inputRef}
      id="search-input"
      type="search"
      placeholder="Search catalog… (/)"
      value={localValue}
      maxLength={50}
      onChange={handleChange}
      data-testid="input-search"
    />
  );
}
