# 📖 Architecture Update Log

> **Purpose:** This log tracks structural and architectural changes made to the Red de CAD platform over time. Unlike standard git commits, this log serves as a "Chain of Ripple Effects," documenting not just *what* was changed, but *why*, and *what else* had to be touched to maintain synchrony across the UI, the Database, and the Blueprints.

---

### [2026-03-11] 🏗️ Profile Expansion & Form Streamlining

**Goal:** The Project Manager requested pulling specific identity/structural data (~15 questions) out of the massive `06_Form_Content.md` and placing them directly into the CAD Profile so they are visible on the Intranet. Two additional queries were recovered from the base `Formulario_Diagnostico_CAD.pdf`. 

**Ripple Effects & Touched Files:**
1. **Database Schema (`09_Cad_profile_DB_Schema.md`):**
   - Added `estado` (Activo, Satélite, Inactivo)
   - Added `grupo_motor` (Sí, No)
   - Added `perfiles_equipo` (Array)
   - Added `propiedad_instalaciones` (Select)
2. **Postgres Migration (`db/supabase_profile_expansion.sql`):**
   - Consolidated the above new columns into the main `ALTER TABLE` statement for `cad_profiles`.
3. **Data Service Layer (`lib/supabaseService.js`):**
   - **CRITICAL FIX:** Added the 4 new database columns to the `profileService.update()` payload. *Without this, the React UI would submit the data, but the API layer would silently drop the fields.*
4. **React UI (`app/(protected)/profile/page.jsx`):**
   - Added Checkboxes, Selects, and state initialization for `estado`, `grupo_motor`, `perfiles_equipo`, and `propiedad_instalaciones`.
5. **Blueprint (`06_Form_Content.md` & `app/(protected)/form/page.jsx`):**
   - Removed the redundant "Identificación" questions from the recurring Diagnostic Form to prevent asking the CADs for the same data twice.

---

### [2026-03-11] 🚀 Pre-Launch Scalability & Login Refactor

**Goal:** The Project Manager requested that the massive logic inside the Diagnostic Form and CAD Profile be made scalable for short-term dynamic changes, and requested a review of the "Send link and login" loop.

**Ripple Effects & Touched Files:**
1. **Frontend Configuration (`config/diagnosticForm.js` + `config/profileOptions.js`):**
   - *NEW:* Created these two isolated configuration files to store the massive arrays of questions, tooltips, tags, and categories.
2. **React UI (`app/(protected)/profile/page.jsx` + `app/(protected)/form/page.jsx`):**
   - Purged over 300 lines of hardcoded arrays and objects and replaced them with clean `import` statements. This means non-developers can edit the config files without fearing they will break the React state logic.
3. **Database Schema (`09_Cad_profile_DB_Schema.md`):**
   - Defined architectural rules for future form changes: If a new dynamic question is added to the config, rather than triggering a new Postgres migration, the frontend should stash the loose variables into the existing `madurez_evaluacion JSONB` (or a similar JSONB column).
4. **Authentication Flow (`app/login/page.jsx`):**
   - Fixed a vital bug where the Supabase Magic Link (`signInWithOtp`) was redirecting authenticated users to a non-existent `/dashboard` route. Rerouted it to correctly land on `/profile`.
