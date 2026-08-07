import { Product } from "../types/product";
import { loadProducts } from "./csv-parser";

class ProductStore {
  private products: Product[] = [];
  private vendors: string[] = [];
  private categories: string[] = [];
  private initialized = false;

  public initialize() {
    if (this.initialized) return;

    this.products = loadProducts();

    // Extract unique vendors
    const vendorSet = new Set<string>();
    const categorySet = new Set<string>();

    for (const p of this.products) {
      if (p.vendor) vendorSet.add(p.vendor);
      if (p.category) categorySet.add(p.category);
    }

    // Sort alphabetically
    this.vendors = Array.from(vendorSet).sort();
    this.categories = Array.from(categorySet).sort();

    this.initialized = true;
    console.log(
      `ProductStore initialized with ${this.products.length} products.`,
    );
  }

  public getAllProducts(): Product[] {
    this.initialize();
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    this.initialize();
    return this.products.find((p) => p.id === id);
  }

  public getVendors(): string[] {
    this.initialize();
    return this.vendors;
  }

  public getCategories(): string[] {
    this.initialize();
    return this.categories;
  }

  public getVendorCounts(): { vendor: string; count: number }[] {
    this.initialize();
    const counts = new Map<string, number>();
    for (const product of this.products) {
      if (!product.vendor) continue;
      counts.set(product.vendor, (counts.get(product.vendor) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([vendor, count]) => ({ vendor, count }))
      .sort((a, b) => a.vendor.localeCompare(b.vendor));
  }

  public getCategoryCounts(): { category: string; count: number }[] {
    this.initialize();
    const counts = new Map<string, number>();
    for (const product of this.products) {
      if (!product.category) continue;
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }
}

// Module-level singleton
const store = new ProductStore();

export function getProductStore() {
  store.initialize();
  return store;
}
