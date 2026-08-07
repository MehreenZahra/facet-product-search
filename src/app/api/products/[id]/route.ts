import { NextRequest, NextResponse } from "next/server";
import { getProductStore } from "@/lib/product-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const store = getProductStore();
  const product = store.getProductById(params.id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
