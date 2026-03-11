# 🏗️ RedCAD Hub: Engineering Architecture & Methodology

> **Target Audience:** Product Manager & Technical Team
> **Purpose:** This document establishes the foundational rules, scalable architecture, and engineering methodology for the RedCAD Hub Web Application. It acts as the bridge between Product Vision and Code Implementation.

---

## 💡 Resumen Ejecutivo (Para Perfiles No Técnicos)
Este documento explica cómo está construida la aplicación por dentro. Para entenderlo fácilmente, casi como un restaurante:
- **El Frontend (React/Next.js):** Es el comedor y los camareros. Es lo que el usuario final ve (botones, menús, colores) y con lo que interactúa. Está construido con piezas de Lego reutilizables (ej. si diseñamos un "botón verde", lo usamos en todos lados en vez de programarlo 20 veces).
- **El Backend (Supabase):** Es la cocina y la caja fuerte. Es donde se guardan verdaderamente los datos (Base de Datos) y quien vigila permanentemente quién tiene permiso para entrar a qué página (Autenticación y Seguridad).
- **La Metodología:** La regla es que antes de construir cualquier "módulo nuevo", primero dibujaremos el plano conceptual (los documentos Blueprint que estás leyendo).

---

## 1. ⚙️ Engineering Methodology (How We Work)

As we scale this from an MVP to a full enterprise-grade application for 16+ CADs, we must follow a strict engineering methodology:

1. **Blueprint First:** Before coding any Module, we define its precise requirements, data models, and UI flow in the `/Blueprint` folder.
2. **Component-Driven Development:** We don't build monolithic pages. We build small, reusable Lego blocks (e.g., `Button`, `Table`, `FilterSidebar`) and assemble them into pages.
3. **Separation of Concerns:**
   - **UI (View):** React Components (Tailwind CSS for styling).
   - **Logic (Controller):** Custom React Hooks and utility functions.
   - **Data (Model):** Supabase Database and Server Actions.
4. **Learn-As-We-Go:** As the Engineering Team, every major code change will be explained conceptually to the PM.

---

## 2. 🗂️ Scalable Codebase Structure (The Next.js App Router)

The application lives in `/Product/frontend`. Here is how the actual code is organized for maximum scalability:

```text
frontend/
├── app/                        # The APP ROUTER (Pages & Routing)
│   ├── (auth)/                 # Public routes (Login, Recover Password)
│   ├── (protected)/            # Protected routes (Requires Login)
│   │   ├── dashboard/          # Module 0: The Hub Menu
│   │   ├── form/               # Module 1: Diagnostic Forms
│   │   ├── catalog/            # Module 3: Global Catalog
│   │   ├── import/             # Module 2: POD Data Normalization
│   │   └── layout.jsx          # The Global Sidebar Wrapper
│   └── globals.css             # Global Tailwind Styles
│
├── components/                 # REUSABLE UI LEGO BLOCKS
│   ├── ui/                     # Generic UI (Buttons, Inputs, Cards)
│   ├── layout/                 # Structural UI (Sidebar, Navbar)
│   └── modules/                # Complex UI specific to a module (e.g., ProductTable)
│
├── lib/                        # BUSINESS LOGIC & UTILITIES
│   ├── supabase/               # Database connection clients
│   ├── utils.js                # Helper functions (e.g., formatCurrency, formatDate)
│   └── parsers/                # Excel/CSV parsing logic for POD data
│
├── hooks/                      # CUSTOM REACT HOOKS
│   └── useUserData.js          # E.g., hook to fetch the current CAD's profile
│
└── types/                      # (Future) Data schemas and types
```

---

## 3. 💾 Database Architecture (Supabase)

Supabase handles our PostgreSQL database, Authentication, and Security.

### Core Architecture Rules:
1. **Row Level Security (RLS) is Mandatory:** No user can read or write data that doesn't belong to their `cad_id` unless explicitly permitted (like the Public Global Catalog).
2. **Relational Integrity:** We use strict Foreign Keys. A `Product` must belong to a valid `CAD`.

### The Core Tables (So far):
- `diagnostic_forms`: Stores the 63 answers. Linked to the user's `auth.uid`.
- `products`: The unified standard catalog (Category, Origin, Format).
- `prices_availability`: The junction table defining how much volume a CAD has of a specific product and at what price.

---

## 4. 🗺️ Module Blueprints (The Roadmap)

Every module will have its own detailed technical spec. Here is the high-level map:

### 🟢 Module 1: Diagnóstico (Phase 1 MVP - Built)
- **Tech:** React Hook Form + Supabase UPSERT.
- **Concept:** A massive state machine that saves progress automatically.

### 🔵 Module 2: Integración POD (In Progress)
- **Tech:** `xlsx` parser library + Edge Functions/Server Actions.
- **Concept:** Reads rows from Excel. Maps `NOMBRE DEL PRODUCTO` to our `nombre`, `PRECIO` to `precio_venta`, etc. Sanitizes data before injecting it into Supabase.

### 🟡 Module 3: Catálogo Global "Mega-Tabla" (Next)
- **Tech:** Server-side pagination, complex SQL filtering (Vector/Full-text search).
- **Concept:** A data-grid UI (like Airtable/Notion) pulling from `public.products` joined with `public.prices_availability`.

### 🟣 Module 4: Perfiles y Directorio CAD (Future)
- **Tech:** Dynamic routing (`/directory/[cad_id]`).
- **Concept:** Auto-generated digital portfolios pulling data from the `diagnostic_forms` results.

---

## 5. 🤝 How We Will Collaborate

From now on:
1. I will propose the **Blueprint** for a specific feature.
2. You (PM) approve or modify the Blueprint.
3. I (Engineering) write the code, placing it in the specific folders (`components/`, `lib/`, `app/`).
4. I explain *which* folders changed and *why*.
5. You test the feature locally.

---

## 6. 🌱 Strategic Answers for the PM

You raised excellent questions about scaling this from a form to an Enterprise Intranet. Here is the engineering reality for each:

### Q1: How do we create a profile for each CAD based on their form?
**The Engineering Plan:** 
Once a CAD submits their `diagnostic_forms`, we use a **Supabase Database Trigger**. 
A Trigger is a piece of code that runs automatically when data is saved. When the form is saved, the Trigger will extract the CAD's Name, Logo, Location, and calculated "Maturity Score" and inject it into a new table called `cad_profiles`. 
Then, in Next.js, we will build a dynamic page (`app/(protected)/directory/[cad_id]`) that reads that specific profile and renders a beautiful dashboard just for them.

### Q2: Will there be an Admin Tool for the Secretaría Técnica?
**The Engineering Plan:** 
Yes, absolutely. We will introduce **Role-Based Access Control (RBAC)** in Supabase.
Right now, everyone is a standard User. We will add an `is_admin = true` flag to specific emails (like yours). 
We will then build an entirely separate module at `app/(protected)/admin/page.jsx`. If a standard CAD tries to visit it, the system kicks them out. When *you* visit it, you will see a massive control panel showing the progress of all 16 CADs, export buttons to CSV, and analytics.

### Q3: How do we pre-fill documentation to set up an environment for each CAD?
**The Engineering Plan:** 
We handle this through **Seed Data & Onboarding Scripts**.
Instead of asking CADs to start from zero, we (the engineering team) will write a script that takes an Excel file *you* provide (containing all 16 CADs, their emails, and what we already know about them).
We run this script once into Supabase. It creates their accounts and populates their `cad_profiles`. 
When the CAD coordinator logs in for the first time via Magic Link, the system says: *"Welcome! We already know you are CAD X. Please confirm this data and finish your diagnostic form."* This is called a "Claim Your Profile" flow and drastically increases adoption rates!
