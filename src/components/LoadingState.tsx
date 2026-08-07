'use client';

export function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 h-56 rounded-3xl bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-4 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="mt-3 h-3 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      ))}
    </div>
  );
}
