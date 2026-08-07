'use client';

export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      <h2 className="text-2xl font-semibold">No products found</h2>
      <p className="mt-3 text-sm leading-6">Try adjusting your search or filters to discover more health and wellness products.</p>
    </div>
  );
}
