---
Title: 00_Master_Roadmap
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Project Management
  Dependencies: [01_Intranet_Project_Plan.md]
  Related_Code: []
  Core_Entities: []
---

# 🗺️ Master Roadmap & Big Picture Tracker

## 🧑‍💼 The Human Translation
> **What is this document?**
> Think of this as the "You Are Here" map at a shopping mall. It doesn't tell you how the mall was built or what materials were used. It simply shows you what stores are open right now, what stores are currently under construction, and what expansion wings are planned for next year. If you want to know if a feature is finished or pending, check here first.
>
> **How to read it:**
> - 🟢 = This module is fully built and working in production.
> - 🟡 = This module is currently being built or has partial functionality.
> - ⏳ = This module is planned but no code has been written yet.
> - Each module has sub-tasks showing the specific features completed or pending.

---

> **Technical Purpose:** This document tracks the high-level progress of the **Red de CAD / Intranet** project. While the `10_Architecture_Update_Log.md` tracks *past* architectural decisions and ripples, this roadmap tracks the *future* and the *current* state of the entire platform. Any AI agent or developer entering the project should read this FIRST to understand what has been built, what hasn't, and what is in progress.

---

## 🟢 1. Core Platform & Identity (COMPLETED)
*The foundational skeleton of the application is fully operational.*
- [x] **Next.js 14+ App Router** initialized with proper folder structure (`3_Product/frontend/`)
- [x] **Tailwind CSS** configured with the RedCAD custom color palette (forest, sage, cream, sand)
- [x] **Supabase Backend** connected (PostgreSQL, Auth, Storage)
- [x] **CI/CD Pipeline** — Commits to `main` trigger automatic Vercel deployments
- [x] **UI Branding** — Giasat-branded header, footer, and color scheme applied globally
- [x] **Row Level Security (RLS)** configured on all tables to ensure data isolation between CADs
- [x] **Dashboard** — Landing page showing network overview
- [x] **Directory** — Public (within-network) listing of all CAD profiles

> **Key Architectural Decisions Made:**
> - The App Router (not Pages Router) was chosen for Server Component support and cleaner layouts.
> - Supabase was chosen over Firebase because PostgreSQL's relational model is essential for the product catalog's complex JOINs.
> - Tailwind was chosen over Material UI for lighter bundle sizes and full styling control.

## 🟢 2. Authentication & Access (COMPLETED)
*Every CAD has a secure, admin-managed login.*
- [x] **Admin-managed Password Authentication** — Replaced Magic Links due to Supabase free-tier rate limits (See `10_Architecture_Update_Log.md`, entry [2026-03-11])
- [x] **Admin Bypass** — A shared admin account can access the `/admin` dashboard and manage all CADs
- [x] **Email Resolving** — The login system intelligently resolves which email belongs to which CAD, even when there are multiple team members
- [x] **Redirect Routing** — After login, CADs are automatically redirected to their `/profile` page (not a blank dashboard)
- [x] **Multi-Admin Support** — An existing admin can create new admin accounts from the UI

> **Key Architectural Decisions Made:**
> - Magic Links were abandoned after hitting Supabase's 4-emails-per-hour limit on the free tier.
> - Password creation is admin-only (CADs cannot self-register). This is intentional — the network is invitation-only.

## 🟢 3. The CAD Profile (COMPLETED)
*Each cooperative has a rich, editable identity page.*
- [x] **Database Schema** — `cad_profiles` table with 15+ columns including JSONB fields
- [x] **Dynamic Fields** — Identity, Maturity semaphore, Intercooperation capabilities
- [x] **Multiple Team Members** — Each CAD can register multiple contact persons
- [x] **Scalability** — Hardcoded dropdowns and arrays extracted to `config/profileOptions.js`
- [x] **JSONB Architecture** — `madurez_evaluacion` column allows the PM to add new maturity metrics without database migrations
- [x] **Admin Expansion** — Added `estado`, `grupo_motor`, `perfiles_equipo`, and `propiedad_instalaciones` columns (See `10_Architecture_Update_Log.md`, entry [2026-03-11])

> **Key Architectural Decisions Made:**
> - 15 static identity questions were ripped OUT of the Diagnostic Form and moved here. This prevents asking CADs the same questions every year.
> - JSONB was chosen for maturity evaluations to avoid endless `ALTER TABLE` migrations.

## 🟢 4. The Diagnostic Form (COMPLETED)
*The 63-question annual health check for each cooperative.*
- [x] **8-block sequential form** with progress tracking
- [x] **UI Styling** synced with the overarching RedCAD Hub theme (forest green, cream background)
- [x] **Scalability** — 300+ lines of questions exported to `config/diagnosticForm.js`. Anyone (even non-technical profiles) can edit those files like a word document to change the questions instantly.
- [x] **Automatic Saving** — Form progress is persisted to Supabase on each block navigation
- [x] **Conditional Logic** — Question 0.2 only appears if Question 0.1 is answered "No"

> **Key Architectural Decisions Made:**
> - Product-related questions were removed from the form entirely. Product data enters via the POD Parser (Module 2).
> - All question text lives in `config/diagnosticForm.js`, not in the React component, enabling content changes without code changes.

---

## 🟡 5. Admin Control Panel (IN PROGRESS)
*The Secretaría Técnica's command center.*
- [x] View list of all registered CADs (basic table)
- [ ] Change CAD status (Activo, Satélite, Inactivo)
- [ ] Assign CADs to the "Grupo Motor" steering committee
- [ ] Export diagnostic data to CSV/Excel for external analysis
- [ ] **Impersonation** — Admin clicks "View as CAD Murcia" to fill forms on their behalf
- [ ] Data visualization — Aggregated maturity maps across the entire network

> **Remaining Work:**
> The admin panel currently shows a basic list. It needs status management, export functionality, and the Impersonation feature (See `04_Pilot_Project_and_RBAC.md` for the full specification).

## ⏳ 6. The "Products" / Catalog Module (PENDING)
*The network-wide product database for intercooperation.*
- [ ] **Database Schema** — Tables `products` and `prices_availability` (See `08_Product_module_DB_Schema.md`)
- [ ] **POD Parser** — Automated Excel import tool (See `03_Products_module_blueprint.md`)
- [ ] **Manual Product Builder** — UI for CADs without digital ERP systems
- [ ] **Network Catalog** — Searchable, filterable view of all products across all CADs
- [ ] **Seasonal Availability** — Calendar view showing when products are in season

> **Why this matters:**
> This is the module that enables real economic intercooperation. Without it, CADs cannot see what other CADs are selling, and the entire network remains a directory of names rather than a marketplace.

## ⏳ 7. The Intercooperation Tools (PENDING)
*The social and collaborative features.*
- [ ] Forums or message boards for network-wide discussions
- [ ] Direct connection requests based on "Intercooperación Técnica" flags (e.g., "I can teach logistics" ↔ "I need to learn logistics")
- [ ] Event calendar for network meetups and training sessions
- [ ] Notification system for new product matches between CADs

---

## 🚀 Vision and Success Metrics

The ultimate goal of the RedCAD Hub is to become the "Digital Nervous System" of the network. It replaces the current fragmented approach (Google Forms + Excel + WhatsApp) with a single, secure, beautiful platform.

### Success Metrics (KPIs)
| Metric | Target | How We Measure It |
|--------|--------|-------------------|
| **Platform Adoption** | 100% of the 16 affiliated CADs actively using the platform | `SELECT COUNT(*) FROM cad_profiles WHERE estado = 'Activo'` |
| **Diagnostic Completion** | 100% of CADs have submitted their 63-question diagnostic form | `SELECT COUNT(*) FROM diagnostic_forms WHERE submitted_at IS NOT NULL` |
| **Catalog Coverage** | At least 12 CADs have uploaded their product catalogs | `SELECT COUNT(DISTINCT cad_id) FROM prices_availability` |
| **Intercooperation Events** | At least 3 formal product exchanges facilitated by the platform within 6 months | Manual tracking by the Secretaría Técnica |
| **User Satisfaction** | NPS score > 7 from CAD coordinators | Post-pilot survey |

### Long-Term Vision (12-24 months)
1. **Public Catalog:** A consumer-facing version of the product catalog, allowing end customers to discover the network's combined offering.
2. **API Integration with POD:** Instead of manual Excel uploads, a direct API connection to Plant on Demand that syncs product data automatically.
3. **Financial Dashboard:** Aggregated economic indicators across the network for grant reporting and strategic planning.
