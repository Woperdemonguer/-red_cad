---
Title: 01_Intranet_Project_Plan
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Application Architecture & Core Logic
  Dependencies: [02_Architecture_and_Methodology.md, 08_Product_module_DB_Schema.md]
  Related_Code: [3_Product/frontend/app/layout.jsx, 3_Product/frontend/app/(protected)/layout.jsx]
  Core_Entities: [cad_profiles, products, diagnostic_forms, prices_availability]
---

# RedCAD Hub — Plan de proyecto
## Intranet de la Red Estatal de Centros Agroecológicos de Distribución
### Documento técnico para el desarrollo — Marzo 2026

## 🧑‍💼 The Human Translation
> **What is this document?**
> Think of this as the master blueprint for a new digital city: The RedCAD Hub. It explains *why* we are building the city (to connect cooperatives), *who* will live there (the 16 CADs and the Technical Secretariat), and *what buildings* exist (the Dashboard, the Directory, the Forms). 
> 
> **The Analogies:**
> - **The Platform itself:** A "Digital Nervous System" that brings a fragmented network together. Before it existed, cooperatives communicated via WhatsApp, Google Forms, and shared Excel spreadsheets. This platform replaces all of that.
> - **The Modules:** Like different rooms in a house. The Dashboard is the lobby (you see an overview), the Directory is the phonebook (who is everyone?), the Form is the annual doctor's checkup (how healthy is each cooperative?), and the Catalog is the marketplace (what are you selling?).
> - **The Users:** There are two types of residents in this city. The **CAD Coordinators** (the 16 cooperative teams) who see their own data and the public network directory. And the **Secretaría Técnica** (the administrators) who have the master key to see everything, help anyone, and export reports.

---

> **Technical Purpose:** Master product specification for the RedCAD Hub outlining the vision, architecture, features, data model, and development roadmap. This document is the single source of truth for "what are we building and why."

---

## 1. Visión del producto

### ¿Qué es?
Una aplicación web interna (intranet) para la Red Estatal de CAD impulsada por GIASAT. Funciona como el "sistema nervioso digital" de la red: el lugar donde las agrupaciones se conocen, comparten oferta, identifican oportunidades de intercambio, acceden a recursos de intercooperación técnica, y coordinan su actividad conjunta.

### ¿Para quién?
| User Type | Who are they? | What can they do? | How many? |
|-----------|---------------|--------------------|-----------| 
| **CAD Coordinators** | Technical staff, managers, and coordinators of the 16 affiliated CADs | View/edit their own profile, fill the diagnostic form, browse the network directory, upload their product catalog | ~16 accounts (growing) |
| **Secretaría Técnica** | CERAI + POD + GIASAT team | Full admin access, view all data, impersonate CADs, export analytics, manage passwords | ~3-5 accounts |
| **Future: Productores** | Individual farmers within a CAD | (Phase 4) Limited access to the catalog and availability calendar | Hundreds |

### ¿Qué problema resuelve?
Joel (La Diligencia) lo expresó bien en Coruña: *"la capacidad técnica es muy grande y quizá solo falta cómo estructurar toda esta información, pero tener claro dónde está ubicada"*. Nani proponía *"una web con embajadores expertos por reto"*. Fernando pedía *"una herramienta para compartir los catálogos y generar una imagen conjunta como red"*. 

**Before RedCAD Hub:**
- Google Forms for diagnostics (no re-editability, no data cross-referencing)
- Excel spreadsheets shared via email (version conflicts, no normalization)
- WhatsApp groups for coordination (messages lost, no structure)
- Google Drive for document storage (no search, no tagging)

**After RedCAD Hub:**
- Structured, secure, re-editable diagnostic forms with automatic data persistence
- A unified product catalog with standardized categories and real-time availability
- A searchable directory of cooperatives with maturity maps
- A single admin panel with impersonation, exports, and analytics

---

## 2. Contexto del proyecto

### 2.1. La Red de CAD
- **16 CAD adheridos** a la red estatal, distribuidos por toda España (Andalucía, Cataluña, Madrid, Galicia, Canarias, etc.)
- **Diversidad enorme:** Desde cooperativas con 8 personas en plantilla y facturación > 1M€ hasta agrupaciones gestionadas informalmente por las propias personas productoras con ingresos < 50K€.
- **Tres líneas de trabajo:** Intercooperación económica (comprar/vender entre CADs), intercooperación técnica (compartir conocimientos), gobernanza (cómo se toman decisiones en red).
- **Financiación principal:** Fundación Daniel y Nina Carasso (proyecto DDF2026-0003, 299.600€, 24 meses).
- **POD (Plant on Demand):** La cooperativa de software del consorcio GIASAT, responsable de la transformación digital. Fuente principal de datos de producto de los CADs.

### 2.2. Ecosistema digital existente
| Tool | Role | Integration with RedCAD Hub |
|------|------|-----------------------------|
| **POD** | ERP para gestión de CADs y productores | Excel export → POD Parser (Module 2) |
| **giasat.org** | Web pública del consorcio | Visual branding alignment |
| **giasat.org/app/home** | Toolkit GIASAT (5 áreas) | Future content integration |
| **Google Drive** | Repositorio de documentación | May be linked from the Resources module |
| **Google Forms** | Formularios de diagnóstico (legacy) | Fully replaced by Module 1 |
| **WhatsApp** | Comunicación informal | Partially replaced by the platform's notification system |

### 2.3. Decisiones ya tomadas que afectan al producto
1. La información granular de producto se recoge por **importación directa** (POD/ERP/Excel), no por formulario.
2. Se **precumplimenta** la ficha de cada CAD con lo que ya se sabe (Seed Script).
3. Se usa un sistema de **autoevaluación tipo semáforo** (🔴🟡🟢) para clasificar madurez por ámbitos.
4. La información económica sensible se trata con **confidencialidad** dentro de la red (RLS, Admin-only access).
5. Se trabaja en **dos velocidades:** intercambios inmediatos (catálogo) + planificación estratégica a largo plazo (mapas de madurez).

---

## 3. Arquitectura del producto

### 3.1. Módulos principales

```text
RedCAD Hub
├── 🏠 Dashboard          (Module 0: Vista general de la red)
├── 📋 Formulario          (Module 1: Diagnóstico de 63 preguntas)
├── 👤 Mi Perfil           (Module 1.5: Identidad estructural del CAD)
├── 🏘️ Directorio          (Module 3: Fichas públicas de agrupaciones)
├── 📦 Catálogo Colectivo  (Module 4: Base de datos de producto)
├── 📥 Importador POD      (Module 2: Parser de Excel → Catálogo)
├── 🔬 Mapa de Madurez     (Module 5: Semáforo intercoop técnica)
├── 🔄 Intercambios        (Module 6: Oferta/demanda entre CAD)
├── 📚 Recursos            (Module 7: Repositorio intercoop técnica)
└── ⚙️ Admin Panel         (Module 8: Panel de administración)
```

### 3.2. Descripción detallada de cada módulo

#### 🏠 Dashboard (Module 0)
**Purpose:** The first thing a CAD sees after logging in. Shows a high-level summary of their own status and the network's activity.
**For CADs:** "Welcome back, Biolur! Your diagnostic form is 75% complete. 3 new products were added to the network this week."
**For Admins:** Aggregated stats — how many CADs have completed the form, total products in the catalog, maturity heat map.

#### 📋 Formulario de Diagnóstico (Module 1)
**Purpose:** The 63-question annual health check. Multi-step wizard with block-by-block navigation and automatic saving.
**Content Source:** `config/diagnosticForm.js` (See `06_Form_Content.md` for the full question script)
**Data Destination:** `diagnostic_forms` table (Admin-only readable)

#### 👤 Mi Perfil (Module 1.5)
**Purpose:** The CAD's permanent identity page. Logo, contact info, maturity semaphore, team members.
**Content Source:** `config/profileOptions.js` for dropdown options
**Data Destination:** `cad_profiles` table (Network-readable)

#### 🏘️ Directorio de CAD (Module 3)
**Purpose:** A searchable, filterable grid of all CAD cards. Each card shows the cooperative's name, region, maturity badges, and key contact info.
**Data Source:** `cad_profiles` table via a single `SELECT *` query (filtered by `estado = 'Activo'`)

#### 📦 Catálogo Colectivo (Module 4)
**Purpose:** The network-wide product marketplace. Users can filter by category, region, season, and certification.
**Data Source:** `products` JOIN `prices_availability` JOIN `cad_profiles`
**Schema:** See `08_Product_module_DB_Schema.md`

#### 📥 Importador POD (Module 2)
**Purpose:** Drag-and-drop Excel upload tool that normalizes POD-exported data into the unified catalog.
**Technical Spec:** See `03_Products_module_blueprint.md`

#### ⚙️ Admin Panel (Module 8)
**Purpose:** The Secretaría Técnica's command center. Manages passwords, impersonates CADs, exports data.
**Technical Spec:** See `04_Pilot_Project_and_RBAC.md`

---

## 4. Stack tecnológico

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Frontend** | Next.js 14+ (App Router) | Server Components for performance, clean routing, React ecosystem |
| **Styling** | Tailwind CSS + Lucide Icons | Lightweight, utility-first, no CSS module overhead |
| **Backend** | Supabase (BaaS) | PostgreSQL for relational JOINs, built-in Auth, RLS, Storage |
| **Auth** | Supabase Auth (Admin-Assigned Passwords) | Replaced Magic Links due to rate limits |
| **Database** | Supabase PostgreSQL | Relational integrity for product catalog, JSONB for dynamic fields |
| **Deployment** | Vercel | Zero-config Next.js deployments, preview URLs for testing |
| **Parsing** | `xlsx` npm library | Industry standard for reading Excel files client-side |

---

## 5. Fases de desarrollo

### Fase 1: MVP — "Lo esencial" (COMPLETED ✅)
- [x] Auth básica restrictiva (Passwords en vez de Magic Links)
- [x] Formulario de diagnóstico dinámico interconectado a la BBDD
- [x] Ficha pre-cumplimentada editable (CAD Profile)
- [x] Dashboard de administrador básico con RBAC

### Fase 2: Catálogo y fichas — "Conocernos" (IN PROGRESS 🟡)
- [ ] Pipeline de importación de datos de producto (POD Parser)
- [ ] Directorio de CAD con Mapas de Madurez
- [ ] Catálogo consultable con filtros

### Fase 3: Intercambios y recursos — "Cooperar" (PLANNED ⏳)
- [ ] Tablón de ofertas/demandas
- [ ] Repositorio de recursos
- [ ] Notification system

### Fase 4: Refinamiento y escalado — "Consolidar" (PLANNED ⏳)
- [ ] Integración API directa con POD
- [ ] Catálogo público para distribución exterior
- [ ] Financial dashboard for grant reporting

---

## 6. Diseño y UX

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `forest` | `#2E5339` | Primary buttons, headers, active states |
| `sage` | `#8BAA7C` | Secondary elements, hover states, tags |
| `cream` | `#FAFAF5` | Page backgrounds, card backgrounds |
| `sand` | `#F0EDE4` | Subtle borders, dividers, sidebar backgrounds |

### Typography
- **Headings:** Inter, semi-bold
- **Body:** Inter, regular
- **Monospace (Code/Data):** JetBrains Mono

### Design Principles
1. **Warmth:** The platform must feel organic and agricultural, not corporate or sterile.
2. **Clarity:** Every page should answer "What am I supposed to do here?" within 3 seconds.
3. **Accessibility:** All interactive elements must be keyboard-navigable and have sufficient color contrast.
