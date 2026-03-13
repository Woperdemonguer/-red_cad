---
Title: 03_Products_module_blueprint
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Data Ingestion & Product Catalog
  Dependencies: [08_Product_module_DB_Schema.md, 07_DB_Interconnections_and_Profiles.md]
  Related_Code: [3_Product/frontend/app/(protected)/import/page.jsx, 3_Product/frontend/lib/parsers/podParser.js, 3_Product/frontend/app/actions/importData.js]
  Core_Entities: [products, prices_availability]
---

# 🏗️ Blueprint: Module 2 (POD Data Integration)

## 🧑‍💼 The Human Translation
> **What is this document?**
> Think of this module as a "Universal Translator Machine" at a shipping port. Right now, every cooperative arrives at the port speaking a different language with their Excel sheets (some call it "Tomate Bio", others "Tomate Pera ECO", others "TOMATE PERA ecologico"). 
> 
> If we let them dump their raw Excel sheets into our database, we would have a chaotic mess — 15 different spellings of the same tomato. This module forces their Excel sheets to pass through a translation pipeline before they touch the database. It reads their columns (which have names like "PRECIO - IVA no incl. (€)"), translates them into our standard language ("precio_venta"), and checks if we already have that product in our warehouse to avoid duplicates.
>
> **The Key Concept — "Upsert":**
> When you upload an Excel sheet, the system doesn't blindly create new entries. It says: "Wait, I already have 'Tomate Pera' from your cooperative. I'll just update the price instead of creating a duplicate." This is called an Upsert (Update + Insert).

---

> **Technical Purpose:** Specification for the automated integration and normalization of Plant On Demand (POD) exported data into the RedCAD Hub catalog. This is the most technically complex module in the application because it bridges external data sources with internal normalized schemas.

---

## ⚙️ 1. The Technical Flow (Step by Step)

### Step 1: The UI (`app/(protected)/import/page.jsx`)
A clean, reassuring drag-and-drop interface that guides non-technical users through the upload process.

**Required UI Components:**
| Component | Location | Purpose |
|-----------|----------|---------|
| `ImportDropzone.jsx` | `components/modules/` | The drag-and-drop file upload area with file type validation |
| `DataPreviewTable.jsx` | `components/modules/` | Shows the first 5 rows of parsed data in a clean HTML table for user confirmation |
| `ImportStatusBar.jsx` | `components/modules/` | Progress bar showing batch upload status (e.g., "Uploading batch 2 of 4...") |

**UX Requirements:**
- Accept ONLY `.xlsx` and `.xls` files. Reject `.csv` and other formats with a clear error message.
- Show a "Vista Previa" (Preview) of the first 5 rows before the user clicks "Importar". This builds trust.
- Display clear error messages for mismatched or corrupted files (e.g., "No se encontró la columna 'NOMBRE DEL PRODUCTO'. ¿Es este un archivo exportado de POD?").
- After successful import, show a summary: "Se importaron 47 productos. 12 actualizados, 35 nuevos."

### Step 2: The Parser Engine (`lib/parsers/podParser.js`)
When the file is dropped, the frontend reads it using the `xlsx` library. The script must look specifically for the headers that POD exports, ignoring the first useless metadata rows (POD exports often have 2-3 header rows before the actual data starts).

**Column Mapping Logic (The Translation Dictionary):**
| POD Excel Column Header | RedCAD Database Field | Transformation |
|---|---|---|
| `NOMBRE DEL PRODUCTO` | `nombre` | Trim whitespace, Title Case |
| `PRECIO - IVA no incl. (€)` | `precio_venta_min` | Parse as float, default 0 if null/empty |
| `ORIGEN` | `origen` | Trim whitespace |
| `CATEGORIA` | `categoria` | Map to strict Enum (see mapping below) |
| `FORMATO DE VENTA` | `formato_venta` | Direct copy, trim whitespace |
| `DISPONIBLE` | `disponible` | Map "Sí"/"Yes"/1 → true, else → false |

**Category Enum Mapping (Critical for Normalization):**
```javascript
const CATEGORY_MAP = {
  'fruta': 'Fruta',
  'frutas': 'Fruta',
  'fruit': 'Fruta',
  'huerta': 'Huerta',
  'hortalizas': 'Huerta',
  'verdura': 'Huerta',
  'verduras': 'Huerta',
  'seco': 'Seco',
  'frutos secos': 'Seco',
  'legumbres': 'Seco',
  // If no match found:
  'DEFAULT': 'Otros'
};
```

### Step 3: Server Actions & Supabase Injection (The Upsert)
Once parsed, we send an array of JSON objects to a Next.js Server Action (`app/actions/importData.js`).

**The Flow:**
1. The Server Action extracts the authenticated user's `cad_id` from the Supabase session (via `await getUser()`).
2. For each product in the batch:
   a. **Check if the product name exists** in the global `products` dictionary. If yes, grab the `product_id`. If no, create a new entry and grab the new `product_id`.
   b. **Upsert into `prices_availability`** using `ON CONFLICT (cad_id, product_id)` — this updates the price/availability if the CAD already offers this product, or creates a new offering if they don't.
3. Return a summary object: `{ created: 35, updated: 12, errors: 0 }`.

**Batch Processing (For Large Files):**
Vercel Serverless Functions have a 10-second execution limit on the free tier and 60 seconds on Pro. To handle large catalogs (1000+ rows), we split the `ImportBatch` into chunks of 100 rows and send them sequentially, updating the progress bar after each chunk.

---

## 📜 2. Strict Data Contract (For AI & Parsers)

Whenever an AI agent or developer edits the `podParser.js`, the output Array must STRICTLY adhere to this TypeScript contract before being sent to the Server Action.

```typescript
// The normalized output the Server Action expects from the Parser
interface ParsedProductPayload {
  // NOT included in the Excel — injected server-side from the session
  cad_id: string;
  
  // Extracted and normalized from the Excel columns
  nombre: string;           // Trimmed, Title Case. E.g. "Tomate Pera"
  precio_venta_min: number; // Must be a float >= 0, default 0 if null
  origen: string | null;    // E.g. "Almería", null if empty
  categoria: "Fruta" | "Huerta" | "Seco" | "Otros"; // Strict enum after mapping
  formato_venta: string;    // E.g. "Caja 10kg", "Bandeja 500g"
  disponible: boolean;      // E.g. true/false. Default true if column missing.
}

// The batch sent to the Server Action
type ImportBatch = ParsedProductPayload[];

// The response from the Server Action
interface ImportResult {
  success: boolean;
  created: number;    // New products added to the catalog
  updated: number;    // Existing products with updated prices
  errors: number;     // Rows that failed validation
  errorDetails: string[]; // E.g. ["Row 47: missing 'nombre'"]
}
```

---

## ⚠️ 3. Critical Risks / Edge Cases

| Risk | Severity | Engineering Solution |
|------|----------|---------------------|
| **Category Mismatch** — POD categories don't match our Enums | Medium | The `CATEGORY_MAP` dictionary catches common variants. Unknown categories → "Otros". Flag to the user after import. |
| **Large Files (1000+ rows)** — May time out Vercel Serverless | High | Split into chunks of 100 rows. Show progress bar. |
| **Duplicate Product Names** — "Tomate Pera" vs "tomate pera" | Medium | Normalize to Title Case before comparison. Use Postgres `LOWER(nombre)` in the deduplication query. |
| **Missing Columns** — Excel doesn't have expected headers | High | Parser validates headers BEFORE processing rows. If critical headers are missing, abort with a clear error message. |
| **Currency Format** — "2,50" vs "2.50" | Low | Replace commas with dots before parsing as float. |
| **Empty Rows** — Excel often has blank rows at the bottom | Low | Filter out rows where `nombre` is null or empty string. |
