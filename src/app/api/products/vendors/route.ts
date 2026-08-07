import { NextResponse } from 'next/server';
import { getProductStore } from '@/lib/product-store';

export async function GET() {
  const store = getProductStore();
  const vendors = store.getVendors();
  return NextResponse.json(vendors);
}
