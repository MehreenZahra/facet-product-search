import { NextRequest, NextResponse } from "next/server";
import { getProductStore } from "@/lib/product-store";
import { productSearchSchema } from "@/lib/validators";
import { searchProducts } from "@/lib/search";
import { Product } from "@/types/product";

function applyFilters(
  products: Product[],
  params: ReturnType<typeof productSearchSchema.parse>,
) {
  return products.filter((product) => {
    if (
      params.vendors &&
      params.vendors.length > 0 &&
      !params.vendors.includes(product.vendor)
    ) {
      return false;
    }

    if (
      params.categories &&
      params.categories.length > 0 &&
      !params.categories.includes(product.category)
    ) {
      return false;
    }

    if (params.minPrice !== undefined && product.price < params.minPrice) {
      return false;
    }

    if (params.maxPrice !== undefined && product.price > params.maxPrice) {
      return false;
    }

    if (params.inStock !== undefined) {
      const isInStock = product.inventory > 0;
      if (params.inStock !== isInStock) {
        return false;
      }
    }

    if (params.tags && params.tags.length > 0) {
      const productTags = product.tags || [];
      const hasAll = params.tags.every((tag) => productTags.includes(tag));
      if (!hasAll) {
        return false;
      }
    }

    return true;
  });
}

function buildQueryObject(url: URL) {
  const query: Record<string, string | string[]> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) {
      query[key] = value;
    } else if (typeof query[key] === "string") {
      query[key] = [query[key] as string, value];
    } else {
      query[key] = [...(query[key] as string[]), value];
    }
  }

  return query;
}

export async function GET(request: NextRequest) {
  const store = getProductStore();
  const products = store.getAllProducts();
  const url = new URL(request.url);
  const query = buildQueryObject(url);

  const parsed = productSearchSchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const params = parsed.data;
  let filteredProducts = applyFilters(products, params);

  let scoredProducts = filteredProducts.map((product) => ({
    product,
    score: 0,
  }));
  if (params.q && params.q.trim() !== "") {
    scoredProducts = searchProducts(filteredProducts, params.q);
  }

  if (params.q && params.q.trim() !== "") {
    scoredProducts.sort((a, b) => b.score - a.score);
  } else if (params.sort === "price_asc") {
    scoredProducts.sort((a, b) => a.product.price - b.product.price);
  } else if (params.sort === "price_desc") {
    scoredProducts.sort((a, b) => b.product.price - a.product.price);
  } else if (params.sort === "name_asc") {
    scoredProducts.sort((a, b) =>
      a.product.title.localeCompare(b.product.title),
    );
  } else if (params.sort === "name_desc") {
    scoredProducts.sort((a, b) =>
      b.product.title.localeCompare(a.product.title),
    );
  }

  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);
  const total = scoredProducts.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pagedProducts = scoredProducts
    .slice(startIndex, startIndex + pageSize)
    .map((item) => item.product);

  return NextResponse.json({
    data: pagedProducts,
    total,
    page,
    pageSize,
    totalPages,
  });
}
