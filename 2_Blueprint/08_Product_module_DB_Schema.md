---
Title: 08_Product_module_DB_Schema
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Database Schema & Product Data
  Dependencies: [03_Products_module_blueprint.md, 07_DB_Interconnections_and_Profiles.md]
  Related_Code: [3_Product/frontend/app/(protected)/catalog/page.jsx, 3_Product/frontend/app/actions/importData.js]
  Core_Entities: [products, prices_availability]
---

# 📦 Schema Blueprint: The Global Product Database

## 🧑‍💼 The Human Translation
> **What is this document?**
> This explains how we avoid chaos when 16 different cooperatives try to sell tomatoes. 
> 
> **The Key Analogy — Dictionary + Price Tags:**
> Imagine a massive international supermarket. If we let every supplier print their own labels, we'd have 15 different descriptions of "Tomate Pera" and the checkout system would break. Instead, we split the stockroom into two exact parts:
> 1. **The Dictionary (products table):** A master list of standardized product definitions. "This is a Tomate Pera. It belongs to the category 'Huerta'. It has ecological certification." This definition is shared across the entire network. An orange is an orange, regardless of who sells it.
> 2. **The Price Tag (prices_availability table):** A temporary sticky-note attached by each individual supplier: "The Murcia Cooperative currently has THIS specific dictionary tomato available at 2.50€/kg, in 10kg boxes, and it's in season from June to September." This information changes every week.
>
> By separating the "what is it" from the "who has it and for how much," we can build powerful features like: "Show me all cooperatives that sell ecological oranges in Andalucía under 3€/kg."

---

> **Technical Purpose:** Defines the exact PostgreSQL database schema for the RedCAD Hub Global Product Catalog. Essential for understanding how the "Mega-Tabla" is constructed, how the two tables link together, and what the JOIN query looks like.

---

## 1. 🏗️ The Schema Architecture (Two-Table Structure)

### Table A: `products` (The Dictionary)
This table stores the immutable, standardized definition of a product. An orange is an orange.

| Column | Type | Constraints | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated unique ID | `a1b2c3d4-...` |
| `nombre` | Text | NOT NULL | Standardized product name | "Tomate Pera" |
| `categoria` | Text (Enum) | NOT NULL | Strict category. Must be one of: Fruta, Huerta, Seco, Otros | "Huerta" |
| `origen` | Text | | Geographic origin | "Almería" |
| `descripcion` | Text | | Optional marketing or technical description | "Variedad autóctona de piel fina" |
| `certificacion` | Text | DEFAULT 'Eco' | Certification type | "Ecológica" |
| `created_at` | Timestamp | DEFAULT now() | When this product entered the network dictionary | 2026-03-15 |

**Important:** This table grows slowly. It only gets new rows when a genuinely new product is introduced to the network. Most imports will find an existing match and skip to the `prices_availability` table.

### Table B: `prices_availability` (The CAD's Specific Offer)
This table links the specific `cad_id` to the `product_id` and adds the volatile pricing/availability data.

| Column | Type | Constraints | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated unique ID | `e5f6g7h8-...` |
| `cad_id` | UUID | FK → `cad_profiles.id`, NOT NULL | Which CAD is selling it | `uuid-of-biolur` |
| `product_id` | UUID | FK → `products.id`, NOT NULL | What product (from the dictionary) | `uuid-of-tomate-pera` |
| `formato_venta` | Text | NOT NULL | Sales format | "Caja 10kg" |
| `precio_venta` | Decimal(10,2) | | Current price in EUR (ex-VAT) | 2.50 |
| `disponible` | Boolean | DEFAULT true | Is it currently available? | true |
| `temporada_inicio` | Date | | Harvest start date | 2026-06-01 |
| `temporada_fin` | Date | | Harvest end date | 2026-09-30 |
| `last_updated` | Timestamp | DEFAULT now() | When this offer was last updated | 2026-03-15 |

**Important:** This table grows rapidly. Each CAD × Product combination creates a row. 16 CADs × 50 products average = ~800 rows. With frequent updates, the `last_updated` timestamp is crucial for the UI to show "Updated 2 days ago" badges.

---

## 📜 2. Strict Data Contract (The Global Catalog JOIN)

When an AI or developer builds the Global Catalog UI (`/catalog`), the Supabase query must produce this exact TypeScript structure:

```typescript
// The materialized Result Set when a user browses the Global Catalog
interface GlobalCatalogItem {
  // From prices_availability
  offer_id: string;
  cad_id: string;
  formato_venta: string;
  precio_venta: number;
  disponible: boolean;
  temporada_inicio: string | null;
  temporada_fin: string | null;
  last_updated: string;
  
  // JOINed from cad_profiles
  cad_name: string;
  cad_territorio: string;
  cad_logo_url: string | null;
  
  // JOINed from products
  product: {
    id: string;
    nombre: string;
    categoria: "Fruta" | "Huerta" | "Seco" | "Otros";
    certificacion: string;
    origen: string | null;
  };
}

// The Supabase query to produce this:
// supabase
//   .from('prices_availability')
//   .select(`
//     id,
//     cad_id,
//     formato_venta,
//     precio_venta,
//     disponible,
//     temporada_inicio,
//     temporada_fin,
//     last_updated,
//     cad_profiles!inner(nombre_comercial, territorio, logo_url),
//     products!inner(id, nombre, categoria, certificacion, origen)
//   `)
//   .eq('disponible', true)
//   .order('last_updated', { ascending: false })
```

---

## 🛡️ 3. Database Security (Row Level Security)

| Table | READ Policy | WRITE Policy | CASCADE Rule |
|-------|------------|-------------|--------------|
| `products` | ALL authenticated users | CADs creating new dictionary entries OR `SUPABASE_SERVICE_ROLE_KEY` via Parser | No cascade — dictionary entries persist even if the creating CAD is deleted |
| `prices_availability` | ALL authenticated users | `auth.uid() = cad_id` — only the owning CAD can modify their offers | `ON DELETE CASCADE` from `cad_profiles` — if a CAD is deleted, their offers are removed |

---

## 4. 🚀 The Two Injection Journeys

### Journey A: The POD Parser ("The Heavy Lifter")
*(See `03_Products_module_blueprint.md` for the full technical spec)*
1. CAD uploads Excel → Parser normalizes → Server Action upserts
2. Handles 400+ rows in batched chunks of 100
3. Uses `ON CONFLICT (cad_id, product_id)` for intelligent deduplication

### Journey B: The Manual Product Builder ("The Artisan")
For smaller CADs without digital ERP systems.
1. User navigates to `/catalog/add`
2. Selects `categoria` from a dropdown
3. Types the product name — autocomplete suggests existing `products` dictionary entries
4. Fills in format, price, and availability
5. Creates one `prices_availability` row (and optionally one `products` row if the item is truly new)
