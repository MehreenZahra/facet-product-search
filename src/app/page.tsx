'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchBar } from '@/components/SearchBar';
import { SortSelect } from '@/components/SortSelect';
import { ProductGrid } from '@/components/ProductGrid';
import { Pagination } from '@/components/Pagination';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Product } from '@/types/product';

const PAGE_SIZE = 20;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('relevance');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, sort]);

  useEffect(() => {
    setLoading(true);
    const searchParams = new URLSearchParams();

    if (debouncedQuery.trim() !== '') {
      searchParams.set('q', debouncedQuery);
    }

    if (sort !== 'relevance') {
      searchParams.set('sort', sort);
    }

    searchParams.set('page', String(page));
    searchParams.set('pageSize', String(PAGE_SIZE));

    fetch(`/api/products?${searchParams.toString()}`)
      .then((response) => response.json())
      .then((result) => {
        setProducts(result.data || []);
        setTotalPages(result.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, sort, page]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Healf</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Wellness product search</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Search the Healf catalogue with filters, sorting, and pagination powered by the product API.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <SearchBar value={query} onChange={setQuery} />
            <SortSelect value={sort} onChange={setSort} />
          </aside>

          <section className="space-y-6">
            {loading ? (
              <LoadingState />
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <ProductGrid products={products} />
            )}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </section>
        </div>
      </div>
    </div>
  );
}
