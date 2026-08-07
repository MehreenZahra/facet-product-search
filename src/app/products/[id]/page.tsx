"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { ProductDetail } from "@/components/ProductDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          className="mb-6 rounded-full bg-white px-4 py-2 text-sm shadow-sm dark:bg-zinc-900"
          onClick={() => router.back()}
        >
          Back
        </button>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            Loading...
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-6 text-red-600 shadow-sm dark:bg-zinc-900">
            {error}
          </div>
        ) : product ? (
          <ProductDetail product={product} />
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            Product not found.
          </div>
        )}
      </div>
    </div>
  );
}
