export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  category: string; // derived from TAGS or PRODUCT_TYPE
  description: string;
  bodyHtml: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  imageUrl: string | null;
  price: number; // min_variant_price
  inventory: number;
  tags: string[];
  onlineStoreUrl: string;
  metafields: {
    ingredients?: string;
    suggestedUse?: string;
    healfPillar?: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
