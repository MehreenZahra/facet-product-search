import { Product } from "../types/product";
import { loadProducts } from "./csv-parser";

class ProductStore {
  private products: Product[] = [];
  private productsById: Map<string, Product> = new Map();
  private vendors: string[] = [];
  private categories: string[] = [];
  private vendorCounts: { vendor: string; count: number }[] = [];
  private categoryCounts: { category: string; count: number }[] = [];
  private initialized = false;

  public initialize() {
    if (this.initialized) return;

    this.products = loadProducts();

    // Build all indexes and caches in a single pass
    const vendorCountMap = new Map<string, number>();
    const categoryCountMap = new Map<string, number>();

    for (const p of this.products) {
      this.productsById.set(p.id, p);
      if (p.vendor) {
        vendorCountMap.set(p.vendor, (vendorCountMap.get(p.vendor) ?? 0) + 1);
      }
      if (p.category) {
        categoryCountMap.set(p.category, (categoryCountMap.get(p.category) ?? 0) + 1);
      }
    }

    // Sort alphabetically and cache
    this.vendors = Array.from(vendorCountMap.keys()).sort();
    this.categories = Array.from(categoryCountMap.keys()).sort();

    this.vendorCounts = Array.from(vendorCountMap.entries())
      .map(([vendor, count]) => ({ vendor, count }))
      .sort((a, b) => a.vendor.localeCompare(b.vendor));

    this.categoryCounts = Array.from(categoryCountMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));

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
    return this.productsById.get(id);
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
    return this.vendorCounts;
  }

  public getCategoryCounts(): { category: string; count: number }[] {
    this.initialize();
    return this.categoryCounts;
  }
}

// Module-level singleton
const store = new ProductStore();

export function getProductStore() {
  store.initialize();
  return store;
}
