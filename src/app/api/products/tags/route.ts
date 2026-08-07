import { NextResponse } from "next/server";
import { getProductStore } from "@/lib/product-store";

export async function GET() {
  const store = getProductStore();
  const products = store.getAllProducts();
  const tagSet = new Set<string>();
  for (const p of products) {
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) tagSet.add(t);
    }
  }
  const tags = Array.from(tagSet).sort();
  return NextResponse.json(tags);
}
