# RedCAD Hub — Phase 1 MVP Implementation Plan

## Goal Description
Build the RedCAD Hub intranet: a web application that functions as the digital nervous system for the 16+ agricultural cooperatives (CADs) in the GIASAT network.

**Phase 1 (MVP) - COMPLETED:** Secure multi-step diagnostic form connected to a PostgreSQL database.
**Phase 2 (Catalogs & Profiles) - CURRENT:** Build a cohesive Product Database collecting structural offer from the CADs, build the CAD directory, and implement data normalization.

## User Review Required
> [!IMPORTANT]
> **Database & Backend Choice:** Please confirm that we are moving forward with **Supabase** as the backend. It perfectly matches the "simplicity, speed, and low cost" criteria from the project plan and handles Authentication, Database (PostgreSQL), and API instantly.
> 
> **Supabase Setup:** I will need you to create a free Supabase account (supabase.com) and create a new project. I will guide you step-by-step on how to give me the keys to connect our app to it. Are you comfortable with this?

## Proposed Changes

We will use **Next.js (App Router)** + **Tailwind CSS** + **Supabase**.

### 1. Project Initialization
- Create a new Next.js project inside the `Product/Frontend` folder.
- Install necessary dependencies (`@supabase/supabase-js`, `lucide-react` for icons).
- Set up the "RedCAD" color palette (forest, sage, cream, sand) in `tailwind.config.js`.

### 2. Database Design (Supabase)
We have successfully implemented the internal forms. For Phase 2, we will add:
- `cad_profiles`: Detailed info about each CAD populated automatically from their form results.
- `products`: Universal catalog schema (category, subcategory, origin, format, certifications).
- `prices_availability`: Junction schema connecting CADs to Products specifying volume, minimum orders, and seasonal availability (1-12 months).

### 3. Authentication Flow
#### [NEW] `app/login/page.jsx`
- A simple, warm, and welcoming login screen.
- CAD coordinators will log in using their assigned fixed email and password managed by the Admin.

### 4. The Dashboard Hub
#### [MODIFY] `app/dashboard/page.jsx` (New Navigation)
- A central "Hub" menu for the CAD coordinator. It will have clear access points to:
  1. The Diagnostic Form (to fill in or edit).
  2. The Product Upload Zone (drag & drop space for their `product_database.xlsx`).

### 5. Product Database Module (Fase 2)
#### `app/form/page.jsx`
- Auto-saving multi-step 63-question form with custom RedCAD Matrix and qualitative tooltips. (COMPLETED).
#### [NEW] `app/catalog/page.jsx`
- The collective offering catalog of the network. Needs heavy filtering capability.
#### [NEW] `app/import/page.jsx`
- The Data Normalization Engine behind the Dashboard's drag-and-drop zone.
- **POD Export Strategy:** Files start with metadata rows; data headers begin on Row 2: `["ID POD","REF","NOMBRE DEL PRODUCTO","PRECIO - IVA no incl. (€)","IVA (%)","STOCK","DESCRIPCIÓN","ORIGEN","CATEGORIA","FORMATO DE VENTA"]`. The engine will map these columns directly into our universal `products` and `prices_availability` tables.
#### [NEW] `app/directory/page.jsx`
- A visual directory showing the 16 CADs, mapping their strengths, and providing their generated Maturity Matrix summary.

### 5. Admin Panel (For Technical Secretariat)
#### [NEW] `app/admin/page.jsx`
- A secure area only accessible by GIASAT/POD admins.
- Shows a list of the 16 CADs and their form completion status.
- A button to "Export to CSV" to download all the answers for analysis in May.

## Verification Plan

### Manual Verification
1. **Local Testing:** I will start a local `localhost` server. You will open it in your browser (and on your phone locally via your network IP) to verify the "RedCAD" aesthetic and the mobile layout.
2. **Form Testing:** We will do a dry-run filling out the 63 questions, deliberately refreshing the page midway to ensure the auto-save feature works flawlessly.
3. **Database Check:** We will look at your Supabase dashboard to visually confirm the data is landing in the tables correctly.
4. **Export Testing:** We will log in as an Admin and click the CSV export button to ensure the generated file opens perfectly in Excel/Google Sheets.
