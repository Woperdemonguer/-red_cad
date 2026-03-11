# 🗄️ Blueprint: Global Product Database Schema (The "Mega-Tabla")

> **Target Audience:** Product Manager
> **Purpose:** To define exactly what the "Global Offer Database" is, what columns it has, and how we solve the problem of 16 CADs uploading chaotic data.

---

## 1. 🤔 The Problem We Are Solving

You correctly identified the biggest challenge of Phase 2:
- 16 different CADs have 16 different ways of naming their products in Excel.
- We need ONE unified "Mega-Tabla Dinámica" where a buyer can say: *"Show me all the 'Manzanas Golden' available in the network in October, sorted by price."*

**The Solution: A Two-Table Relational Database.**
We do *not* put everything in one giant table. That causes duplicates and data corruption. Instead, we split it into two tables that talk to each other:

1. **`products` (El Diccionario Global):** The dictionary of *what* a product is.
2. **`prices_availability` (La Oferta Específica):** *Who* sells it, for *how much*, and *when*.

---

## 2. 📊 The Data Schema (Las Columnas de la Base de Datos)

Here is the exact structure we will build in Supabase (PostgreSQL).

### Table 1: `products` (El "Producto Final" Universal)
This table stores the standardized definition of the food. It prevents CAD A from calling it "Patata Brava" and CAD B calling it "Patatas Bravas".

| Column Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Identificador Único Universal | `123e4567-e89b...` |
| `nombre` | Text | Nombre comercial del producto | "Tomate Pera Eco" |
| `categoria` | Enum | La macro-familia del producto | `Huerta`, `Fruta`, `Lácteos` |
| `subcategoria` | Text | Familia específica | "Tomate" |
| `variedad` | Text | Raza botánica / tipo exacto | "Pera" |
| `calibre` | Text | Tamaño / Calibre | "M", "L", "Calibre 4" |
| `formato_venta` | Text | Cómo se vende | "Caja 6kg", "Granel", "Unidad" |
| `tipo_envase` | Text | Empaquetado | "Caja Cartón", "Saco" |
| `certificaciones` | Array | Lista de sellos | `["Eco", "GlobalGAP"]` |
| `conservacion` | Enum | Temp. de almacenaje | `Ambiente`, `Frío`, `Congelado` |
| `vida_util_dias` | Int | Días que dura fresco | `15` |
| `origen` | Enum | Producción propia o ajena | `Producción CAD`, `Producción Externa` |

---

### Table 2: `prices_availability` (La Oferta del CAD)
This table links a CAD to a Product in the dictionary, defining their specific commercial offer.

| Column Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Identificador único de la oferta | `987f654...` |
| `product_id` | FK | Enlace a la tabla `products` | *(Link to "Tomate Pera Eco")* |
| `cad_id` | FK | Enlace a la cooperativa ofertante | *(Link to "Biolur CAD")* |
| `precio_venta_min` | Float | Precio Base (€) | `1.50` |
| `precio_venta_max` | Float | Precio techo/PVP (€) | `2.10` |
| `capacidad_kg` | Int | Volumen anual aproximado | `15000` |
| `meses_disponibles` | Array | En qué meses se puede comprar | `[6, 7, 8, 9]` (Jun-Sep) |
| `pedido_minimo` | Int | Cantidad mínima de compra | `100` (Pallet) |

---

## 3. 🔄 The Convergence Process (How CADs upload data to this Schema)

How do we actually get CADs to fill out this massive database? We offer two distinct paths (Modules):

### Path A: The "POD Parser" (Automated Integration)
*For CADs that use Plant On Demand or structured ERPs.*
1. The CAD uploads their raw `export.xlsx` to the web app (`app/import/page.jsx`).
2. Our **Normalization Engine** (the script we are writing) intercepts the file.
3. The engine mathematically maps the Excel columns to our schema (e.g., POD column 'CATEGORIA' is forced into our Enum `categoria`).
4. The system shows the CAD a preview: *"We translated 450 products to the RedCAD standard. 12 have errors (unknown category). Please fix them."*
5. Upon confirmation, data is injected into the Supabase schema.

### Path B: The "Product Builder" Form (Manual Entry)
*For smaller CADs without ERPs.*
1. We will build a dedicated Product Creation Form (similar to the Diagnostic form, but specifically for food).
2. The CAD logs in and fills out standard dropdowns (Category, Format, Price) to manually push products into the "Mega-Tabla".
3. Because they use our dropdowns, the data is automatically standardized from the start.

## 4. 📈 The Result: The Mega-Tabla
Because all 16 CADs are forced into this structure (either via automated parsing or manual forms), the **Global Product Catalog (`app/catalog/page.jsx`)** can easily pull from Supabase and show a beautiful UI with filters like:
- *Show me all `category: Huerta` AND `subcategoria: Tomate` available in `meses_disponibles: [8]` (August).*
