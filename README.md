# FACET — Multi-Faceted Product Search

A production-grade product search application providing fast, faceted product discovery for **4,587 active products** through a filterable, responsive interface.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Zod · Lucide React

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Decisions](#architecture-decisions)
- [Folder Structure](#folder-structure)
- [Data Pipeline](#data-pipeline)
- [Caching Strategy](#caching-strategy)
- [Search Algorithm](#search-algorithm)
- [API Reference](#api-reference)
- [UI & Feature Overview](#ui--feature-overview)
- [Trade-offs](#trade-offs)
- [What Breaks at 500,000 Products](#what-breaks-at-500000-products)
- [What I Would Improve With Another Week](#what-i-would-improve-with-another-week)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Preprocess the CSV into optimised JSON (one-time step)
npx tsx scripts/preprocess.ts

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Prerequisite:** The source CSV must be placed at `data/products.csv`. The preprocessor reads it once and outputs `data/products.json` (~16 MB). The server never touches the CSV again.

---

## Architecture Decisions

### Why preprocess to JSON instead of parsing CSV at runtime?

The raw CSV is **51 MB** with 5,954 rows and 47 columns. Parsing it with PapaParse on every cold start would add **200–400 ms** of latency before the first API response. Instead, we run a one-time `scripts/preprocess.ts` step that:

1. Parses the CSV with PapaParse
2. Applies all exclusion rules (status, price, inventory — see [Data Pipeline](#data-pipeline))
3. Extracts and normalises fields (JSON-embedded images, metafields, tags)
4. Derives categories from tags using a heuristic pipeline
5. Writes a clean `products.json` (16 MB) that the runtime reads with `fs.readFileSync` + `JSON.parse`

This converts a **47-column CSV parse** into a **typed JSON deserialisation** — roughly 10× faster on cold start.

### Why a module-level singleton instead of a database?

The dataset is static (no writes, no concurrent mutations). A database would add deployment complexity (connection strings, migrations, cold-start pool setup) with zero benefit for a read-only catalogue of this size. Instead:

- `product-store.ts` instantiates a single `ProductStore` class at module scope
- On first access, it calls `loadProducts()` to read `products.json` into memory
- An `initialized` flag ensures the file is read exactly once per Node.js process
- All subsequent requests read from in-memory arrays — **microsecond** access times

On Vercel, each serverless function instance keeps its own copy. Cold starts re-parse (~50 ms for JSON vs ~300 ms for CSV). Within a warm instance, all requests share the same data — zero I/O.

### Why Next.js App Router API routes instead of a separate backend?

The assessment requires Next.js. Using App Router API routes (`src/app/api/`) keeps the data layer, API, and UI in a single deployable unit. The singleton pattern works because Next.js API routes share the same Node.js process in development and per-instance in production.

### Why Zod for query validation?

URL query parameters arrive as raw strings. Zod schemas (`src/lib/validators.ts`) handle the full pipeline — type coercion (`"42"` → `42`), array normalisation (single string vs repeated params), enum validation for sort order, and defaults (`page=1`, `pageSize=20`). Invalid requests get a structured 400 error with field-level messages instead of silent runtime failures.

---

## Folder Structure

```
healf-product-search/
├── data/
│   ├── products.csv              # 51 MB source data (Shopify export, 5,954 rows)
│   └── products.json             # 16 MB preprocessed output (4,587 products)
├── scripts/
│   └── preprocess.ts             # CSV → JSON pipeline with filtering + enrichment
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: navbar, stats strip, dark mode
│   │   ├── page.tsx              # Homepage: search, filters, product grid, pagination
│   │   ├── globals.css           # Design tokens (HSL), fonts, scrollbar, dark mode
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Product detail page with recently viewed
│   │   └── api/
│   │       └── products/
│   │           ├── route.ts      # GET /api/products — search, filter, sort, paginate
│   │           ├── [id]/
│   │           │   └── route.ts  # GET /api/products/:id
│   │           ├── vendors/
│   │           │   └── route.ts  # GET /api/products/vendors
│   │           └── categories/
│   │               └── route.ts  # GET /api/products/categories
│   ├── components/
│   │   ├── SearchBar.tsx         # Search input with Lucide icon + ref for "/" shortcut
│   │   ├── FilterPanel.tsx       # Sidebar: availability toggle, price range, brands, categories
│   │   ├── SortSelect.tsx        # Sort dropdown (relevance, price, name)
│   │   ├── ProductCard.tsx       # Card with image fallback, out-of-stock badge, highlight
│   │   ├── ProductGrid.tsx       # Responsive grid wrapper
│   │   ├── ProductDetail.tsx     # Legacy detail component (superseded by page route)
│   │   ├── DarkModeToggle.tsx    # Sun/Moon toggle with localStorage persistence
│   │   ├── Pagination.tsx        # Page controls
│   │   ├── EmptyState.tsx        # "No results" illustration
│   │   ├── LoadingState.tsx      # Generic loading indicator
│   │   └── ui/                   # Primitive design system (Badge, Button, Card, etc.)
│   ├── hooks/
│   │   ├── useDebounce.ts        # Generic debounce hook (300 ms default)
│   │   ├── useFilters.ts         # URL-synchronised filter state manager
│   │   └── useRecentlyViewed.ts  # localStorage-backed recently viewed tracker
│   ├── lib/
│   │   ├── csv-parser.ts         # Reads products.json into Product[]
│   │   ├── product-store.ts      # Singleton in-memory store with lazy initialisation
│   │   ├── search.ts             # Weighted token search with relevance scoring
│   │   ├── highlight.tsx         # Client-side search term highlighting (<mark> tags)
│   │   ├── validators.ts         # Zod schemas for API query parameters
│   │   └── utils.ts              # cn() helper, formatCurrency()
│   └── types/
│       └── product.ts            # Product interface + PaginatedResponse<T> generic
├── .env.local                    # CSV_FILE_PATH config
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Data Pipeline

The source CSV contains **5,954 products** across 47 columns. The preprocessor (`scripts/preprocess.ts`) applies three sequential exclusion filters:

### Exclusion Rules

| Rule | Condition | Excluded | Rationale |
|---|---|---|---|
| **Status** | `STATUS !== 'ACTIVE'` | ~1,347 | ARCHIVED products have `ONLINE_STORE_URL = NONE` (dead links). DRAFT products are unpublished internal items. Only ACTIVE products belong in a storefront. |
| **Zero Price** | `min_variant_price <= 0`, applied to remaining 4,607 ACTIVE products | ~19 | Internal marketing materials, broken syncs — not purchasable. (Note: 78 total zero-price rows exist dataset-wide, but 59 were already removed by the status filter above.) |
| **Corrupted Inventory** | `inventory < -500`, applied to remaining 4,588 | ~1 | Distinguishes broken sync data from legitimate slight overselling. |

**Result: 5,954 → 4,587 products** (22.9% excluded).

### Category Derivation

87.8% of products have an empty `PRODUCT_TYPE` field. Categories are derived from the `TAGS` column using a **priority-ordered heuristic**:

```
Priority  Tag match                        → Category
────────  ───────────────────────────────  ────────────────────────
1         "Sleep" / "Falling Asleep"       → Sleep
2         "Energy"                         → Energy
3         "Brain Health" / "Mind"          → Brain Health
4         "Digestion" / "Gut"             → Digestion
5         "Skin" / "Hair Skin and Nails"   → Skin & Beauty
6         "Protein"                        → Protein
7         "Immune"                         → Immune Support
8         "Stress and Anxiety"             → Stress & Anxiety
9         "Heart Health"                   → Heart Health
10        "Vitamins & Supplements"         → Vitamins & Supplements
11        (no match)                       → General Wellness
```

**Resolution order:** If `PRODUCT_TYPE` is set → use it as-is (authoritative). If empty → walk the priority list, use first tag match. If nothing matches → "General Wellness".

> **Transparency note:** This is a heuristic workaround for a real data gap. The native `PRODUCT_TYPE` field is populated for only 12.2% of products. The mapping was designed by auditing actual tag distributions in the dataset. It should not be treated as clean structured data.

### Tag Cleaning

Raw tags contain internal prefixes and pipe-delimited metadata that leak implementation details:

- Tags containing `|` are stripped (these are internal Shopify filter keys like `goal:Sleep|filter:Category`)
- `filter:` and `goal:` prefixes are removed
- Duplicates are eliminated

---

## Caching Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                     BUILD TIME (one-off)                     │
│  CSV (51 MB) ──→ preprocess.ts ──→ products.json (16 MB)    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   RUNTIME (per process)                      │
│                                                              │
│  1st request → ProductStore.initialize()                     │
│              → fs.readFileSync('products.json')              │
│              → JSON.parse()  (~50 ms)                        │
│              → Build vendor Set, category Set                │
│              → Store in module-level singleton                │
│                                                              │
│  2nd+ request → Read from in-memory Product[]                │
│               → Filter/search/sort/paginate                  │
│               → Return JSON  (~2–5 ms)                       │
└──────────────────────────────────────────────────────────────┘
```

**Key properties:**

- **Zero re-parsing:** The CSV is never read at runtime. The JSON is read once per process.
- **Lazy initialisation:** The `initialized` boolean guard in `ProductStore.initialize()` ensures the file is loaded on first access and never again.
- **Process-level persistence:** In development, the singleton lives for the duration of the dev server. In production (Vercel), it lives for the duration of the serverless function instance.
- **No external cache dependencies:** No Redis, no Memcached, no CDN cache headers to configure. The data lives in V8 heap memory.
- **Cold start cost:** ~50 ms to parse 16 MB of JSON. Acceptable for serverless. After warm-up, every request is pure in-memory computation.

---

## Search Algorithm

The search engine (`src/lib/search.ts`) implements **weighted token-based partial matching** with relevance scoring. No external search library is used — it is pure JavaScript string matching.

### How It Works

1. **Tokenisation:** The query string is lowercased, trimmed, and split on whitespace. `"mitoq curcumin"` becomes `["mitoq", "curcumin"]`.

2. **Two-pass scoring:** Each product is scored against the query:

   **Pass 1 — Full-phrase match (high signal):**
   | Condition | Score |
   |---|---|
   | Title exactly equals query | **+5** |
   | Title contains full query as substring | **+3** |

   **Pass 2 — Per-token match (additive, per token):**
   | Field | Score per token |
   |---|---|
   | Title contains token | **+1.5** (3 × 0.5) |
   | Vendor contains token | **+2** |
   | Description contains token | **+1** |

3. **Filtering:** Products with score = 0 are excluded from results entirely.

4. **Sorting:** When a search query is active, results are sorted by score descending. When no query is present, the user's chosen sort order (price, name) applies.

### Why These Weights?

The title carries the strongest purchase-intent signal — a user searching "magnesium" expects products with "magnesium" in the name, not products where it appears in a 500-word description. Vendor is weighted second because brand searches ("Thorne", "MitoQ") are common in health & wellness. Description is weighted lowest — it provides recall (finding products that mention a term somewhere) but not precision.

### Search Highlighting

On the client side, `src/lib/highlight.tsx` provides a `highlightText()` function that:
1. Splits the query into tokens
2. Escapes regex special characters for safety
3. Builds a case-insensitive regex: `/(token1|token2)/gi`
4. Splits the product title on matches and wraps hits in `<mark>` elements with a subtle blue tint

This runs only when a search query is active — zero overhead on default catalogue view.

---

## API Reference

All endpoints return JSON. Query parameters are validated with Zod — malformed requests receive a `400` response with structured error messages.

### `GET /api/products`

Main search, filter, sort, and pagination endpoint.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | `string` | — | Free-text search query |
| `vendors` | `string[]` | — | Filter by vendor (multi-select, repeated param) |
| `categories` | `string[]` | — | Filter by category |
| `tags` | `string[]` | — | Filter by tags (all must match) |
| `minPrice` | `number` | — | Minimum price (GBP) |
| `maxPrice` | `number` | — | Maximum price (GBP) |
| `inStock` | `boolean` | — | `true` = inventory > 0 only |
| `sort` | `enum` | `relevance` | `relevance`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `20` | Results per page |

**Response shape:**
```json
{
  "data": [Product],
  "total": 4587,
  "page": 1,
  "pageSize": 20,
  "totalPages": 230
}
```

### `GET /api/products/:id`

Returns a single product by ID, or `404` if not found.

### `GET /api/products/vendors`

Returns all unique vendor names, sorted alphabetically.

### `GET /api/products/categories`

Returns all unique category names, sorted alphabetically.

---

## UI & Feature Overview

### Homepage (`/`)

- **Sidebar layout:** Persistent 288px sidebar with search, filters, and active filter pills
- **Search:** Debounced at 300 ms via `useDebounce` hook. Press `/` to focus (keyboard shortcut)
- **Filters:** Availability toggle (custom switch), £-prefixed price range inputs, scrollable brand + category lists with product count badges
- **Active filter pills:** Each applied filter appears as a removable pill with a count badge on the "Filters" heading
- **Product grid:** Responsive — 1 col on mobile, 2 on sm, 3 on md, 4 on xl
- **Loading state:** 8 skeleton cards with pulse animation during initial load
- **Empty state:** Friendly "No products found" with a "Clear All Filters" action
- **Error state:** Retry button with visual feedback
- **Pagination:** Previous/Next with "Page X of Y · N total" info strip. Scrolls to top on page change
- **URL state:** All filter state is synced to the URL via `useFilters` hook — searches are shareable and survive page refresh

### Product Detail (`/products/[id]`)

- Sticky product image (stays visible while scrolling details on desktop)
- Vendor badge, full price, in-stock/out-of-stock status with colour-coded icons
- Rich HTML description rendered from `BODY_HTML` via `dangerouslySetInnerHTML`
- Metafield sections: Ingredients, Suggested Use (when available)
- All product tags displayed as badges
- "View on Healf" external link (filtered — hidden when URL is `NONE`)
- **Recently Viewed** section: Powered by `useRecentlyViewed` hook — stores up to 10 products in `localStorage`, deduplicates by ID, shows up to 4 previously visited products

### Dark Mode

Client-side toggle (`DarkModeToggle.tsx`) using Lucide Sun/Moon icons. Theme preference persists in `localStorage`. Respects system preference on first visit. All colours use HSL CSS custom properties with `.dark` variant overrides.

### Design System

- **Fonts:** Inter (body) + Plus Jakarta Sans (headings) from Google Fonts
- **Colours:** Full HSL token system — `--primary: 230 100% 60%` (blue), semantic tokens for `muted`, `secondary`, `border`, `card`, `destructive`
- **Primitives:** Reusable `ui/` components (Badge, Button, Card, Skeleton, Separator) for consistent styling
- **Icons:** Lucide React throughout (Package, Filter, Search, ChevronLeft, etc.)

---

## Trade-offs

### Chose: In-memory array scan · Over: Inverted index / full-text engine

**What we get:** Zero dependencies, simple code, easy debugging. For 4,587 products, a full scan with scoring completes in ~2–5 ms — imperceptible to users.

**What we lose:** At 100,000+ products, linear scan becomes noticeable. An inverted index (or Flexsearch/MiniSearch) would give O(1) lookups per token instead of O(n) per scan.

### Chose: Build-time JSON preprocessing · Over: Runtime CSV parsing

**What we get:** ~50 ms cold start instead of ~300 ms. Clean, typed data. Exclusion rules applied once.

**What we lose:** A two-step setup (`npx tsx scripts/preprocess.ts` then `npm run dev`). If the CSV changes, the preprocessor must be re-run manually. An automated watcher or Git hook could mitigate this.

### Chose: Client-side fetching (`fetch` in `useEffect`) · Over: Server Components with RSC streaming

**What we get:** Full client-side interactivity — debounced search, URL sync, active filter pills, loading/placeholder states. The sidebar is always responsive.

**What we lose:** Initial HTML contains no product data (no SSR SEO for product listings). A hybrid approach (server-render the first page, client-side for subsequent interactions) would be ideal but adds complexity.

### Chose: Heuristic category derivation from tags · Over: Leaving 87.8% of products uncategorised

**What we get:** Every product has a meaningful category. The filter panel is useful instead of showing "Uncategorised" for 5,000+ items.

**What we lose:** The categories are approximations, not authoritative data. A product tagged both "Sleep" and "Energy" is assigned "Sleep" because it has higher priority. The mapping is documented and transparent, but it is a heuristic — not clean source data.

### Chose: `Map<id, Product>` for ID lookups · Over: `Array.find()`

**What we get:** O(1) product detail lookups regardless of catalogue size, built during the same initialization pass as vendor/category extraction — no added cost to set up.

**What we lose:** Slightly more state to keep in sync (the array and the Map both hold references to the same product objects) — though since both are built once at init and never mutated afterward, this isn't a real risk in practice.

### Chose: Skip Tags as a filter · Over: Building a tags checkbox UI

**What we get:** A clean, usable filter panel. Vendor and category are meaningful, curated dimensions.

**What we lose:** Tags were listed as a bonus filter in the requirements. Investigated implementing it, but the raw dataset has 1,212 unique tags, many of which are internal operational metadata rather than customer-facing labels (e.g. `top_3500_net_sales`, `hidden`, `OOSwithoutpreorder`, pricing config strings, and inconsistent casing like `Eat`/`EAT`). A usable tags filter would need a real data-cleaning and deduplication pass first — reducing to a curated, human-meaningful subset — which was out of scope given the time available. The backend API already supports tag filtering (`applyFilters()` handles a `tags` param), so the groundwork exists if this were prioritized later.

---

## What Breaks at 500,000 Products

| Component | Current behaviour | Failure mode at 500K |
|---|---|---|
| **JSON file size** | 16 MB for 4.5K products | ~1.7 GB. `fs.readFileSync` + `JSON.parse` would take **3–8 seconds** on cold start. V8 heap would need ~4 GB. Serverless functions have 1–3 GB memory limits. |
| **Search (linear scan)** | 2–5 ms for 4.5K products | ~200–500 ms per request. Every keystroke triggers a full scan. Users would experience visible lag. |
| **Filter pipeline** | `Array.filter()` over full dataset | ~100–200 ms per request. Combined with search, total latency approaches 500 ms+ — above the perceptible threshold. |
| **Vendor/category lists** | ~440 vendors, 10 categories | Potentially 10,000+ vendors. The sidebar checkbox list becomes unusable without virtualisation or search-within-filter. |
| **Pagination sort** | `Array.sort()` on filtered results | Sorting 500K objects takes ~300 ms per request (V8 Timsort). Needs pre-sorted indices. |
| **Singleton memory** | ~80 MB heap for 4.5K products | ~8 GB heap. Exceeds serverless memory limits. Multiple instances multiply the cost. |
| **Preprocessing** | ~2 seconds for 51 MB CSV | ~20 minutes for a 5 GB CSV. Build-time preprocessing becomes a deployment bottleneck. |

### What you'd need to do differently

1. **Database:** PostgreSQL with GIN indexes for full-text search, B-tree indexes on price/vendor/category. Eliminates memory constraints entirely.
2. **Search engine:** Elasticsearch or Typesense for sub-10 ms full-text search with faceted filtering. MeiliSearch for a lighter alternative.
3. **Streaming ingestion:** Replace batch preprocessing with an incremental pipeline (queue-based CSV row processing).
4. **Cursor-based pagination:** Offset pagination (`SKIP n`) degrades at high page numbers. Cursor pagination (keyset) stays O(1).
5. **Virtualised UI:** React Virtual or TanStack Virtual for brand/category lists with 10K+ items.

---

## What I Would Improve With Another Week

### Performance

- **Inverted search index:** Build a pre-computed token → product ID map at initialisation. Eliminates linear scan — search becomes O(tokens × matches) instead of O(n).
- **Response caching:** Add `Cache-Control` headers on API responses. For static data, `stale-while-revalidate` gives instant perceived performance.
- **Image optimisation:** Replace raw `<img>` tags with Next.js `<Image>` component for automatic WebP conversion, lazy loading, and CDN-edge caching.Deprioritised given the dataset's inconsistent image availability (~7-8% of products missing images) and the added complexity of pairing `next/image`'s error handling with the existing placeholder fallback logic.
- **Image URL validation:** Some product image URLs in the source dataset return 404s (Shopify CDN links that have since been removed, likely because the CSV export is a point-in-time snapshot). Currently handled with a client-side `onError` fallback that swaps to a placeholder. With more time, a build-time validation pass during preprocessing could check URLs upfront and flag or pre-filter dead links, rather than relying on the browser to discover the failure at runtime.

### Features

- **Fuzzy search:** Add Levenshtein distance matching for typo tolerance ("magneisum" → "magnesium"). Either custom implementation or integrate Fuse.js.
- **Favourites:** `localStorage`-backed "Save for later" with a heart icon on each card. The `useRecentlyViewed` pattern can be reused directly.
- **Mobile filter drawer:** Replace the always-visible sidebar with a slide-out drawer on mobile. The sidebar currently pushes content on small screens.
- **Infinite scroll option:** Add infinite scroll as an alternative to pagination, using Intersection Observer.
- **Analytics:** Track search queries, filter usage, and product clicks to understand user intent and improve the category heuristic.


### Code Quality

- **Automated tests:** Jest unit tests for `searchProducts()`, `applyFilters()`, and `getDerivedCategory()`. Playwright E2E tests for the search-filter-paginate flow.
- **Error boundaries:** React error boundaries around the product grid and detail page to catch rendering failures gracefully.
- **Accessibility audit:** Full WCAG 2.1 AA compliance — focus management, ARIA labels on filter controls, screen reader announcements for result count changes.

---

## License

Built for the North Foundry engineering assessment.
