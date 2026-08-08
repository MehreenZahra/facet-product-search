import React from "react";

interface FacetLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function FacetLogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="facet-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="facet-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="facet-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* Outer Diamond/Prism outline with faceted geometry */}
      {/* Top Facet */}
      <polygon points="20,3 34,14 20,20 6,14" fill="url(#facet-grad-1)" />
      {/* Bottom Left Facet */}
      <polygon points="6,14 20,20 20,37" fill="url(#facet-grad-2)" />
      {/* Bottom Right Facet */}
      <polygon points="34,14 20,20 20,37" fill="url(#facet-grad-3)" />
      {/* Inner Accent facet shine line */}
      <polyline points="20,3 20,20 34,14" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <polyline points="6,14 20,20 20,37" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

export default function FacetLogo({
  className = "",
  size = 32,
  showText = true,
  textClassName = "",
}: FacetLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center p-1.5 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
        <FacetLogoIcon size={size} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-wider text-xl leading-none font-display uppercase bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent ${textClassName}`}>
            FACET
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-tight mt-0.5">
            Search
          </span>
        </div>
      )}
    </div>
  );
}
