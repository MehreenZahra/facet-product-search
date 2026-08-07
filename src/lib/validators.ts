import { z } from 'zod';

export const productSearchSchema = z.object({
  q: z.string().optional(),
  vendors: z.union([z.string(), z.array(z.string())])
    .transform(val => Array.isArray(val) ? val : [val])
    .optional(),
  categories: z.union([z.string(), z.array(z.string())])
    .transform(val => Array.isArray(val) ? val : [val])
    .optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  inStock: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  tags: z.union([z.string(), z.array(z.string())])
    .transform(val => Array.isArray(val) ? val : [val])
    .optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).default('relevance'),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  pageSize: z.string().regex(/^\d+$/).transform(Number).default(20),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;
