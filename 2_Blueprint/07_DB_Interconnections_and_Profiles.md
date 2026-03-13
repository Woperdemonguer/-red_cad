---
Title: 07_DB_Interconnections_and_Profiles
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Database Architecture & Data Flow
  Dependencies: [08_Product_module_DB_Schema.md, 09_Cad_profile_DB_Schema.md, 04_Pilot_Project_and_RBAC.md]
  Related_Code: [3_Product/frontend/lib/supabaseService.js]
  Core_Entities: [cad_profiles, diagnostic_forms, products, prices_availability, auth.users]
---

# 🕸️ El "Efecto Mariposa" de la BBDD (Interconexiones)

## 🧑‍💼 The Human Translation
> **What is this document?**
> This explains how the different pieces of information link together so the website doesn't collapse under its own weight. 
> 
> **The Key Analogy — Three Filing Cabinets:**
> Imagine you have a physical office with three separate filing cabinets. Each cabinet has a different lock and different access rules:
> 1. **The Public Bulletin Board (`cad_profiles`):** Anyone walking into the office can see who works here, their photo, their phone number, and what they specialize in. This is the "Network Directory."
> 2. **The HR Locked Cabinet (`diagnostic_forms`):** Contains the private, sensitive health checkups of each business — their revenue, their internal tensions, their financial struggles. Only the HR Manager (Admin) has the key to this cabinet. Regular employees (other CADs) cannot see inside.
> 3. **The Live Stockroom (`products` & `prices_availability`):** Items constantly moving in and out every week. The tomatoes arrive on Monday, the price changes on Wednesday, and they're sold out by Friday. This information is public within the office (everyone can see what's in stock), but each department can only update their own shelf.
>
> By keeping data in three different cabinets rather than one giant messy folder, the system runs extremely fast (small precise queries), very securely (RLS controls who sees what), and is easy to maintain (changes to one cabinet don't break the others).

---

> **Technical Purpose:** Explains the strict separation of concerns across the core PostgreSQL database schema logic. Essential for understanding how data flows between the frontend and the backend tables, why certain data lives in certain tables, and how the Impersonation feature works architecturally.

---

> **Regla de Oro:** *"Nunca le pidas a un usuario el mismo dato dos veces."*

---

## 1. 🏗️ El Problema del Formulario Monolítico

In early versions, ALL data lived in a single massive table. This created three critical problems:

| Problem | Why it's Bad | Our Solution |
|---------|-------------|--------------|
| **Bloated Form** — 80+ questions including static identity data | Users abandon long forms. The founding year of a cooperative doesn't change annually. | Split static identity → `cad_profiles`. Dynamic health → `diagnostic_forms`. |
| **Security Nightmare** — Financial data mixed with public profile data | If we make the table readable for the Directory, everyone sees everyone's revenue. | `cad_profiles` = public. `diagnostic_forms` = Admin-only via RLS. |
| **Product Data in Forms** — "What products do you sell?" as a text question | Free-text answers like "tomatoes, peppers" are useless for cross-referencing supply and demand. | Separate tables (`products`, `prices_availability`) with normalized columns, populated via POD Parser. |

---

## 2. 🧩 La Tríada de Esquemas

La plataforma RedCAD Hub deposita los datos de los usuarios fragmentándolos matemáticamente en 3 niveles distintos, vinculados por el `cad_id` proporcionado por el token JWT autenticado (vía Supabase Auth).

### 2.1. Nivel 1: `cad_profiles` (La Cara Pública)
| Aspect | Detail |
|--------|--------|
| **Contains** | Structural identity: Logo, name, description, territory, email, phone, maturity JSONB, intercooperation JSONB |
| **Who reads it** | ALL authenticated users. Powers the Directory and Dashboard. |
| **Who writes it** | The owning CAD (via `/profile` page). Admins (via impersonation or seed script). |
| **RLS Policy** | `SELECT`: All authenticated. `INSERT/UPDATE`: `auth.uid() = id`. |
| **Analogy** | The cooperative's **business card** — public-facing, permanent, rarely changes. |

### 2.2. Nivel 2: `diagnostic_forms` (Las Entrañas)
| Aspect | Detail |
|--------|--------|
| **Contains** | The 63 answers to the diagnostic form — financial health, governance tensions, maturity self-assessment |
| **Who reads it** | EXCLUSIVELY the Secretaría Técnica (Admin role). Other CADs CANNOT see this. |
| **Who writes it** | The owning CAD (via `/form` page). Admins (via impersonation). |
| **RLS Policy** | `SELECT`: `auth.uid() = cad_id` OR Admin. `INSERT/UPDATE`: `auth.uid() = cad_id`. |
| **Analogy** | The cooperative's **medical record** — private, sensitive, used for internal analysis. |

### 2.3. Nivel 3: `products` + `prices_availability` (El Catálogo Vivo)
| Aspect | Detail |
|--------|--------|
| **Contains** | Thousands of rows of product definitions and per-CAD pricing/availability |
| **Who reads it** | ALL authenticated users. Powers the Network Catalog. |
| **Who writes it** | The owning CAD (via POD Parser or manual entry). `products` dictionary entries can also be created by the Service Role. |
| **RLS Policy** | `SELECT`: All authenticated. `INSERT/UPDATE` on `prices_availability`: `auth.uid() = cad_id`. |
| **Analogy** | The **live marketplace** — volatile, changes weekly, public within the network. |

---

## 3. 🔗 The Data Flow Diagram

```text
                          ┌─────────────────┐
                          │   User Logs In   │
                          │ (auth.uid = UUID)│
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             ┌──────────┐  ┌──────────────┐  ┌──────────────────┐
             │ /profile  │  │    /form      │  │  /catalog        │
             │ READS:    │  │ READS/WRITES: │  │ READS:           │
             │cad_profiles│  │diagnostic_   │  │products JOIN     │
             │ WRITES:   │  │forms         │  │prices_availability│
             │cad_profiles│  │              │  │JOIN cad_profiles │
             └──────────┘  └──────────────┘  └──────────────────┘
```

---

## 4. 🎭 El Truco de "Impersonation" (Manejo de Permisos)

### 4.1. The Problem
The pilot has 16 CADs. Realistically, not all of them will sit down and fill a 63-question form on a website. Some will call the Secretaría Técnica and dictate their answers over the phone or WhatsApp.

### 4.2. The Solution
Instead of building a separate "Admin fills form on behalf of CAD" interface (which would double our maintenance burden), we use **Impersonation:**

1. Admin opens the Admin Dashboard (`/admin`)
2. Clicks "Impersonar" next to "CAD Murcia"
3. A Server Action (`generateImpersonationToken(cad_murcia_uuid)`) mints an ephemeral JWT
4. The frontend's Supabase client receives this token
5. RLS now believes `auth.uid() = cad_murcia_uuid`
6. Admin navigates to `/form` and fills it normally — all saves go to Murcia's `diagnostic_forms` row
7. Admin clicks "Dejar de impersonar" → their original JWT is restored

### 4.3. Security Guarantees
- The impersonation token is **ephemeral** — it expires after a configurable duration
- An **audit trail** records which admin impersonated which CAD and when
- The admin's actual UUID is always trackable via the `ImpersonationContext` object
- Impersonation ONLY works for accounts in `admin_users_mapping` — a regular CAD user cannot impersonate anyone
