---
Title: 10_Architecture_Update_Log
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: System Architecture Log & Decision Record
  Dependencies: []
  Related_Code: []
  Core_Entities: []
---

# 📖 Architecture Update Log

## 🧑‍💼 The Human Translation
> **What is this document?**
> A normal software changes diary ("git commit log") just says "Fixed the password button." This document goes much deeper. It acts as the "Chain of Ripple Effects." 
>
> When an AI or an Engineer makes a major structural change to the house, this document explains:
> 1. **WHY** the wall was knocked down (the PM's request or the technical necessity)
> 2. **WHAT** rooms had to be repainted because of it (the ripple effects across the codebase)
> 3. **HOW** to avoid breaking those rooms again in the future
>
> Think of it like a mechanic's service log for a car. Every major repair is documented with the mileage, the parts replaced, and what else was inspected or adjusted as a consequence.

---

> **Technical Purpose:** This log tracks structural and architectural changes made to the Red de CAD platform over time. Unlike standard git commits, this log serves as a "Chain of Ripple Effects," documenting not just *what* was changed, but *why*, and *what else* had to be touched to maintain synchrony across the UI, Database, Server Actions, and Blueprints.

---

## 📜 Standardized Entry Contract (For AI)

Whenever you (the AI Agent) drastically alter the architecture, you MUST append a new entry to the bottom of this file using the exact following Markdown format. Do NOT modify or delete existing entries — this is an append-only log.

```markdown
### [YYYY-MM-DD] 🚀 Title of Major Change

**Goal:** [What the PM wanted AND why the conventional approach wouldn't work]

**Ripple Effects & Touched Files:**
1. **[Domain Area] (`path/to/file.jsx`):**
   - [What changed and why it matters structurally]
2. **[Domain Area] (`path/to/file.jsx`):**
   - [What changed]

**Risk Assessment:** [Low / Medium / High — what could break if someone reverts this change]
```

---

## 🗃️ Architecture Log Archive

*(Entries are chronologically ordered. Newest entries go at the bottom.)*

---

### [2026-03-11] 🔐 Migration to Password-Based Authentication

**Goal:** Overcome Supabase free-tier rate limits with Magic Links (4 emails/hour limit) and provide administrators with explicit control over CAD access by migrating entirely to a User/Password paradigm. The Magic Link approach was fundamentally incompatible with our pilot timeline — if 16 CADs tried to log in during a demo, only 4 would receive their email.

**Ripple Effects & Touched Files:**
1. **Frontend Authentication (`app/login/page.jsx`):**
   - Ripped out `signInWithOtp` (Magic Link) and replaced it with `signInWithPassword`.
   - Updated UI fields to request "Usuario / Correo Electrónico" and "Contraseña".
   - Added error handling for incorrect credentials with user-friendly Spanish messages.
2. **Server Actions (`app/actions/adminAuth.js`):**
   - Authored an Admin-only Server Action to securely interface with the Supabase Admin API using the `SUPABASE_SERVICE_ROLE_KEY`. This allows admins to create/reset passwords for any CAD without needing their email to be validated.
3. **Admin Dashboard UX (`app/(protected)/admin/page.jsx`):**
   - Embedded a "Contraseña" modal for each CAD row, allowing the Secretaría Técnica to instantly force-assign explicit passwords to any entity.
4. **Data Service Layer (`lib/supabaseService.js`):**
   - Added `formService.resolveEmail(cadId)` to intelligently derive the login identity from either the entity's public contact email or the first team member's email, since some CADs have multiple team members and we need to determine which email to use for the login credentials.

**Risk Assessment:** Medium — reverting to Magic Links would require re-disabling the password fields and re-enabling the OTP flow. No data would be lost.

---

### [2026-03-11] 🏗️ Profile Expansion & Form Streamlining

**Goal:** The Project Manager requested pulling specific identity/structural data (~15 questions) out of the massive Diagnostic Form and placing them directly into the CAD Profile so they are visible on the Intranet's public Directory without requiring form completion. Additionally, two new administrative questions were recovered from the base `Formulario_Diagnostico_CAD.pdf` that had been previously missed.

**Ripple Effects & Touched Files:**
1. **Database Schema (`09_Cad_profile_DB_Schema.md` + Supabase SQL Editor):**
   - Added 4 new columns: `estado` (text), `grupo_motor` (boolean), `perfiles_equipo` (text[]), `propiedad_instalaciones` (text).
2. **Postgres Migration (`db/supabase_profile_expansion.sql`):**
   - Consolidated the above into `ALTER TABLE cad_profiles ADD COLUMN IF NOT EXISTS ...` statements. Idempotent — safe to run multiple times.
3. **Data Service Layer (`lib/supabaseService.js`):**
   - **CRITICAL FIX:** Added the 4 new database columns to the `profileService.update()` payload. *Without this, the React UI would submit the data, but the API layer would silently drop the fields because they weren't listed in the `.upsert()` call.* This bug was not visible — no errors, just missing data. This pattern was documented in `.agent/core/lessons_learned.md` as Directive 4.
4. **React UI (`app/(protected)/profile/page.jsx`):**
   - Added Checkboxes, Selects, and state initialization for `estado`, `grupo_motor`, `perfiles_equipo`, and `propiedad_instalaciones`.
5. **Blueprint (`06_Form_Content.md` & `05_Form_Methodology.md`):**
   - Removed the redundant "Identificación" questions from the recurring Diagnostic Form to prevent asking the CADs for the same data twice.

**Risk Assessment:** Low — the column additions are additive. Existing data is preserved.

---

### [2026-03-11] 🚀 Pre-Launch Scalability & Config Extraction

**Goal:** The Project Manager requested that the massive logic inside the Diagnostic Form (~300 lines of question arrays) and CAD Profile be made scalable for short-term dynamic changes, and requested a review of the authentication redirect loop.

**Ripple Effects & Touched Files:**
1. **Frontend Configuration (`config/diagnosticForm.js` + `config/profileOptions.js`):**
   - *NEW FILES CREATED:* These two isolated configuration files now store the massive arrays of questions, tooltips, tags, and dropdown categories that were previously hardcoded in the React components.
2. **React UI (`app/(protected)/profile/page.jsx` + `app/(protected)/form/page.jsx`):**
   - Purged over 300 lines of hardcoded arrays and objects and replaced them with clean `import` statements. This means non-developers can edit the config files to change question text, add new options, or re-order items without understanding React state management.
3. **Database Schema Decision (`09_Cad_profile_DB_Schema.md`):**
   - Defined the architectural rule: future form changes that add dynamic questions should stash the loose variables into the existing `madurez_evaluacion JSONB` (or a similar JSONB column) rather than triggering a new Postgres migration.
4. **Authentication Flow (`app/login/page.jsx`):**
   - Fixed a vital bug where the Supabase login callback was redirecting authenticated users to a non-existent `/dashboard` route. Rerouted post-login redirect to `/profile` (the correct landing page for CAD users).

**Risk Assessment:** Low — changes are purely structural refactoring. No logic or data behavior changed.

---

### [2026-03-12] 📚 Blueprint Audit & Dual-Optimization

**Goal:** Elevate all `2_Blueprint/` documentation to a "Dual-Optimized" state: perfectly parseable by AI agents (via YAML `AI_Context` headers and TypeScript Data Contracts) and easily digestible by non-technical PMs (via real-world analogies in "Human Translation" blocks).

**Ripple Effects & Touched Files:**
1. **All 11 Blueprint Files:** Added standardized YAML frontmatter with `AI_Context`, `Dependencies`, `Related_Code`, and `Core_Entities` fields.
2. **AI Core Directory (`.agent/`):** Created `.agent/core/` folder with `lessons_learned.md`. Migrated AI-specific content out of `2_Blueprint/11_AI_Lessons_Learned.md` (deleted) into the new location.
3. **Master Protocol (`.agent/workflows/master-protocol.md`):** Expanded from ~66 lines to ~200 lines with orchestration tables, tool best practices, database golden rules, and anti-pattern tables.

**Risk Assessment:** Low — documentation-only changes. No code behavior affected.
