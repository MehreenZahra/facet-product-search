import { Product } from '../types/product';

// Search weights
const WEIGHTS = {
  TITLE_EXACT: 5,
  TITLE_PARTIAL: 3,
  VENDOR: 2,
  TAG: 1.5,
  DESCRIPTION: 1,
};

export function searchProducts(products: Product[], query: string): { product: Product, score: number }[] {
  if (!query || query.trim() === '') {
    return products.map(p => ({ product: p, score: 0 }));
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/);

  const scoredProducts = products.map(product => {
    let score = 0;
    const titleLower = product.title.toLowerCase();
    const vendorLower = product.vendor.toLowerCase();
    const descLower = product.description.toLowerCase();
    const tagsLower = product.tags.map(t => t.toLowerCase());

    // Exact match in title (high priority)
    if (titleLower === normalizedQuery) {
      score += WEIGHTS.TITLE_EXACT;
    } else if (titleLower.includes(normalizedQuery)) {
      score += WEIGHTS.TITLE_PARTIAL;
    }

    // Token based scoring
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += WEIGHTS.TITLE_PARTIAL * 0.5;
      if (vendorLower.includes(token)) score += WEIGHTS.VENDOR;
      if (tagsLower.some(t => t.includes(token))) score += WEIGHTS.TAG;
      if (descLower.includes(token)) score += WEIGHTS.DESCRIPTION;
    }

    return { product, score };
  });

  // Filter out products with 0 score (no match)
  return scoredProducts.filter(sp => sp.score > 0);
}
