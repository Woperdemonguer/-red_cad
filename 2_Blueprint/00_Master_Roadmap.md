# 🗺️ Master Roadmap & Big Picture Tracker

> **Purpose:** This document tracks the high-level progress of the **Red de CAD / Intranet** project. While the `10_Architecture_Update_Log.md` tracks *past* architectural decisions and ripples, this roadmap tracks the *future* and the *current* state of the entire platform.

---

## 🟢 1. Core Platform & Identity (COMPLETED)
- [x] Next.js + Tailwind + Supabase Framework Setup
- [x] CI/CD and production environments defined
- [x] UI Branding (Colors, fonts, Giasat logo)
- [x] Supabase Row Level Security (RLS) configured for data isolation
- [x] Dashboard / Directory views

## 🟢 2. Authentication & Access (COMPLETED)
- [x] Passwordless "Magic Link" Authentication
- [x] Admin Bypass (for Development)
- [x] Email Resolving (Ensuring only whitelisted emails can enter)
- [x] Redirect routing to ensure CADs land directly on their profile.

## 🟢 3. The CAD Profile (COMPLETED)
- [x] Database Schema setup (`cad_profiles` table)
- [x] Dynamic fields (Identity, Maturity, Intercooperation)
- [x] Support for multiple team members per CAD
- [x] **Scalability:** Hardcoded dropdowns and arrays extracted to `config/profileOptions.js`
- [x] **Architecture:** `madurez_evaluacion JSONB` column established to capture future unchecked fields without needing a database migration.

## 🟢 4. The Diagnostic Form (COMPLETED)
- [x] Build the 8-block sequential form.
- [x] Sync UI styling with the overarching RedCAD Hub theme.
- [x] **Scalability:** Exported 300+ lines of questions and text into `config/diagnosticForm.js`. Anyone (even non-technical profiles) can edit those files like a word document to change the questions instantly.
- [x] Automatic saving of progress (debounced or manual button).

---

## 🟡 5. Admin Control Panel (IN PROGRESS)
- [ ] View list of all registered CADs
- [ ] Change CAD status (Activo, Satélite, Inactivo)
- [ ] Assign CADs to the "Grupo Motor"
- [ ] Export data to CSV/Excel for external analysis

## ⏳ 6. The "Products" / Catalog Module (PENDING)
- [ ] Database Schema (`08_Product_module_DB_Schema.md`)
- [ ] UI for CADs to add/edit their available products
- [ ] Network-wide searchable catalog for intercooperation

## ⏳ 7. The Intercooperation Tools (PENDING)
- [ ] (Future Scope) Forums, messaging, or direct connection requests based on the "Intercooperación Técnica" flags.
