"use client";

import { useEffect } from "react";
import { Filter, X, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilterCount: number;
  totalResults: number | null;
  onClearAll: () => void;
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  activeFilterCount,
  totalResults,
  onClearAll,
  children,
}: MobileFilterDrawerProps) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-h-[85vh] flex flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle Bar */}
        <div className="w-full flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                data-testid="button-drawer-clear-all"
              >
                <RefreshCcw className="w-3 h-3" /> Clear all
              </button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
              data-testid="button-close-drawer"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          {children}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-border bg-card/95 backdrop-blur shrink-0 flex gap-3">
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={onClearAll}
              className="flex-1 text-xs"
            >
              Reset
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            data-testid="button-apply-filters"
          >
            {totalResults !== null
              ? `Show ${totalResults.toLocaleString()} Product${totalResults !== 1 ? "s" : ""}`
              : "Apply Filters"}
          </Button>
        </div>
      </div>
    </div>
  );
}
