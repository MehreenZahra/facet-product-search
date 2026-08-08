import React from "react";

/**
 * Highlights all occurrences of `query` tokens within `text`.
 * Returns a React fragment with <mark> tags around matches.
 * Safe: escapes regex special characters in the query.
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text;

  // Split query into tokens so "mitoq curcumin" highlights both words
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // escape regex chars

  if (tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(pattern);

  if (parts.length <= 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark
            key={i}
            className="bg-primary/15 text-primary rounded-sm px-0.5 font-semibold"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
