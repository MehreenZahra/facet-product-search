import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Product } from '../src/types/product';

const CSV_PATH = path.join(__dirname, '../data/products.csv');
const OUT_PATH = path.join(__dirname, '../data/products.json');

// The priority-ordered tag heuristic as defined in our plan
const TAG_CATEGORY_MAP: [string[], string][] = [
  [['sleep', 'falling asleep'], 'Sleep'],
  [['energy'], 'Energy'],
  [['brain health', 'mind'], 'Brain Health'],
  [['digestion', 'gut'], 'Digestion'],
  [['skin', 'hair skin and nails'], 'Skin & Beauty'],
  [['protein'], 'Protein'],
  [['immune'], 'Immune Support'],
  [['stress and anxiety'], 'Stress & Anxiety'],
  [['heart health'], 'Heart Health'],
  [['vitamins & supplements'], 'Vitamins & Supplements'],
];

function getDerivedCategory(productType: string, tags: string[]): string {
  if (productType && productType.trim() !== '') {
    return productType.trim();
  }
  
  const lowerTags = tags.map(t => t.toLowerCase());
  for (const [matchTags, category] of TAG_CATEGORY_MAP) {
    if (lowerTags.some(tag => matchTags.includes(tag))) {
      return category;
    }
  }
  return 'General Wellness';
}

function processCSV() {
  console.log('Reading CSV from', CSV_PATH);
  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data as any[];
      console.log(`Parsed ${rows.length} rows.`);
      
      const validProducts: Product[] = [];
      let excludedStatus = 0;
      let excludedPrice = 0;
      let excludedInventory = 0;

      for (const row of rows) {
        // 1. Status Filter
        const status = (row['STATUS'] || '').trim();
        if (status !== 'ACTIVE') {
          excludedStatus++;
          continue;
        }

        // 2. Price Filter
        let minPrice = 0;
        try {
          const priceRaw = row['PRICE_RANGE_V2'];
          if (priceRaw) {
            const priceJson = JSON.parse(priceRaw);
            minPrice = parseFloat(priceJson?.min_variant_price?.amount || '0');
          }
        } catch (e) {
          // ignore parsing error
        }
        if (minPrice <= 0) {
          excludedPrice++;
          continue;
        }

        // 3. Inventory Filter
        const invRaw = row['TOTAL_INVENTORY'];
        const inventory = invRaw ? parseInt(invRaw, 10) : 0;
        if (inventory < -500 || isNaN(inventory)) {
          excludedInventory++;
          continue;
        }

        // Field extraction
        const tagsRaw = row['TAGS'] || '';
        const tags = tagsRaw.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        
        const category = getDerivedCategory(row['PRODUCT_TYPE'], tags);
        
        let imageUrl = null;
        try {
          if (row['FEATURED_IMAGE'] && row['FEATURED_IMAGE'].trim() !== '{}') {
             const imgJson = JSON.parse(row['FEATURED_IMAGE']);
             imageUrl = imgJson.url || null;
          }
        } catch(e) {}

        let metafields = {};
        try {
           if (row['METAFIELDS'] && row['METAFIELDS'].trim() !== '{}') {
              const meta = JSON.parse(row['METAFIELDS']);
              metafields = {
                 ingredients: meta.my_fields_ingredients?.value,
                 suggestedUse: meta.my_fields_suggested_use?.value,
                 healfPillar: meta.my_fields_healf_pillar?.value
              };
           }
        } catch(e) {}

        const product: Product = {
          id: row['ID'] || '',
          title: row['TITLE'] || '',
          handle: row['HANDLE'] || '',
          vendor: row['VENDOR'] || 'Unknown',
          category,
          description: row['DESCRIPTION'] || '',
          bodyHtml: row['BODY_HTML'] || '',
          status: status as 'ACTIVE' | 'ARCHIVED' | 'DRAFT',
          imageUrl,
          price: minPrice,
          inventory,
          tags,
          onlineStoreUrl: row['ONLINE_STORE_URL'] || '',
          metafields,
          createdAt: row['CREATED_AT'] || ''
        };

        if (product.id && product.title) {
          validProducts.push(product);
        }
      }

      console.log(`Filtered products:`);
      console.log(` - Excluded by Status (!= ACTIVE): ${excludedStatus}`);
      console.log(` - Excluded by Price (<= 0): ${excludedPrice}`);
      console.log(` - Excluded by Inventory (< -500): ${excludedInventory}`);
      console.log(`Total valid products: ${validProducts.length}`);

      fs.writeFileSync(OUT_PATH, JSON.stringify(validProducts));
      console.log(`Wrote clean JSON to ${OUT_PATH}`);
    },
    error: (error: any) => {
      console.error('Error parsing CSV:', error);
    }
  });
}

processCSV();
