# 🏗️ Blueprint: Module 2 (POD Data Integration)

> **Status:** Planning / Pending PM Approval
> **Goal:** Create an internal tool for CAD coordinators to upload their `product_database.xlsx` (exported from Plant On Demand) and normalize it into the RedCAD Hub's universal `products` table.

---

## 💡 Resumen Ejecutivo (Para Perfiles No Técnicos)
El Módulo 2 es un "Traductor Automático". Actualmente, cada cooperativa (CAD) tiene sus productos escritos de forma distinta en Excel o en el ERP Plant on Demand (POD). 
Este módulo permite a una cooperativa subir su Excel y el sistema "lee y traduce" automáticamente las columnas (ej. cambia "PRECIO - IVA no incl." a simplemente "Precio"). 
**Regla técnica de oro (Upsert):** Al subir el Excel, si la App detecta que un producto (ej. Tomate Pera, Origen Huesca) ya existía en la base de datos de esa cooperativa, solo se actualizará su *cantidad* o *precio*. Si detecta que es nuevo, creará una nueva tarjeta de producto. Esto evita duplicar información.

---

## 1. ⚙️ The Technical Flow

### Step 1: The UI (app/(protected)/import/page.jsx)
We need a clean, drag-and-drop interface.
- A Dropzone component where users can upload an `.xlsx` file.
- A Visual Preview table that shows the first 5 rows of what the system detected (to build trust).

### Step 2: The Parser Engine (lib/parsers/podParser.js)
When the file is dropped, the frontend reads it using the `xlsx` library.
The script must look specifically for the headers that POD exports, ignoring the first useless metadata rows.

**Column Mapping Logic:**
- POD `NOMBRE DEL PRODUCTO` -> RedCAD `nombre`
- POD `PRECIO - IVA no incl. (€)` -> RedCAD `precio_venta_min`
- POD `ORIGEN` -> RedCAD `origen`
- POD `CATEGORIA` -> RedCAD `categoria` (Will require strict Enum mapping)
- POD `FORMATO DE VENTA` -> RedCAD `formato_venta`

### Step 3: Server Actions & Supabase Injection
Once parsed, we send an array of JSON objects to a Next.js Server Action.
- The Server Action uses the authenticated user's `cad_id` to automatically tag all products.
- It executes a massive `SUPABASE UPSERT`.
  - If a product with the same name already exists for that CAD, it updates the stock/price.
  - If it's new, it creates a new entry.

---

## 2. 🗂️ Required Components to Build

1. `components/modules/ImportDropzone.jsx`: (The Drag & Drop component)
2. `components/modules/DataPreviewTable.jsx`: (The confidence-building preview)
3. `lib/parsers/podParser.js`: (The mathematical mapping logic)
4. `app/(protected)/import/page.jsx`: (The actual Module page where it all lives)

---

## 3. ⚠️ Critical Risks / PM Open Questions
- **Category Mismatch:** POD categories might not perfectly match our RedCAD `categoria` Enums (e.g., "Huerta", "Fruta"). 
  - *Engineering Suggestion:* If the parser finds an unknown category, it flags it as "Otros" and asks the user to manually group it later. Is this acceptable?
