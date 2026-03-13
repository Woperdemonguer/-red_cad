---
Title: AI_Lessons_Learned
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: AI Self-Improvement & Guardrails
  Dependencies: [.agent/workflows/master-protocol.md, 2_Blueprint/10_Architecture_Update_Log.md, 2_Blueprint/12_User_Journeys.md]
  Related_Code: []
  Core_Entities: []
---

# 🧠 AI Lessons Learned & Correction Tracker

## 🧑‍💼 The Human Translation
> **What is this document?**
> When you hire a new junior developer, they will make mistakes. You scold them, tell them the correct way to do it, and hope they remember. 
> Because the AI is wiped clean every session, it doesn't have a "memory" of past mistakes unless we write them down. This document is the AI's permanent memory bank. Whenever it makes a mistake, it writes the correction here so the next AI agent reads it before touching the code.
>
> **How it works in practice:** The AI is instructed (via `.agent/workflows/master-protocol.md`, Rule 1.1.5) to read this entire file at the start of every complex session BEFORE it begins planning or coding. This means every rule written below acts as a permanent behavioral override.

---

> **Technical Purpose:** This document is the persistent "Self-Improvement Loop" for the Antigravity system working on Red de CAD. Whenever the AI makes a mistake, requires user hand-holding, or receives a correction, the pattern MUST be logged here using the Standardized Entry Format below.

---

## 📜 Standardized Entry Format (For AI)

Whenever you (the AI Agent) make a mistake or receive a correction from the PM, you MUST append a new entry to the bottom of this file using the exact following Markdown format:

```markdown
### [YYYY-MM-DD] - [Short Description of the Issue]
- **Mistake:** [What happened]
- **Root Cause:** [Why it happened — the systemic reason, not just "I forgot"]
- **Correction:** [What the PM told you to do instead]
- **New Rule:** [The permanent behavioral override to prevent recurrence]
- **Severity:** [Low / Medium / High / Critical]
```

---

## 🤖 Permanent AI Directives & Overrides

These are the accumulated, battle-tested rules derived from real mistakes made during the development of RedCAD Hub. Each rule was born from a specific correction event.

---

### Directive 1: Scalability Trumps Hardcoding
- **Origin:** During the diagnostic form build, the AI hardcoded 300+ lines of question arrays directly into `form/page.jsx`, making it impossible for a non-developer to edit the questions.
- **The Rule:** Do not write configuration arrays (dropdown options, form questions, navigation items, color tokens) directly into React component files. If an array has more than 5 items, it must live in `config/` and be imported.
- **Affected Files:** `config/diagnosticForm.js`, `config/profileOptions.js`

### Directive 2: Database Flexibility via JSONB
- **Origin:** The PM frequently changes which maturity metrics to track. Each change would have required a new Postgres column migration, involving server downtime.
- **The Rule:** Minor dynamic field changes in forms should be stored in the `madurez_evaluacion JSONB` column (or a similar JSONB column) to avoid excessive Postgres migrations. The frontend reads the JSONB key-value pairs dynamically.
- **Affected Tables:** `cad_profiles.madurez_evaluacion`, `cad_profiles.intercoop_tecnica`

### Directive 3: Correct Tools Over Bash
- **Origin:** The AI used `cat << EOF` inside a bash `run_command` block to write markdown files, causing subtle formatting issues (especially with special characters like backticks and dollar signs) and bypassing the safety checks of the `write_to_file` tool.
- **The Rule:** Never use `cat` inside a bash block to write files when the precise `write_to_file` AI tool is available. The bash approach can cause encoding issues and does not register the file creation in the tool tracking system.
- **Exception:** Using `run_command` for `mkdir -p`, `mv`, `rm`, and `ls` is perfectly fine.

### Directive 4: Silent Field Drops in Supabase Service Layer
- **Origin:** When 4 new columns were added to `cad_profiles` (estado, grupo_motor, perfiles_equipo, propiedad_instalaciones), the React UI was updated to send the new data, but the intermediate data service layer (`lib/supabaseService.js`) was NOT updated. Supabase silently ignored the extra fields, meaning data was lost without any error.
- **The Rule:** Whenever a new column is added to any database table, you MUST update THREE things in lockstep: (1) The SQL migration script, (2) The Supabase service layer function that writes to that table, (3) The React component that calls the service function. If any of the three is missed, data will be silently lost.
- **Affected Files:** `lib/supabaseService.js` → `profileService.update()` payload

### Directive 5: Blueprint Before Code
- **Origin:** Early in the project, features were built ad-hoc without any Blueprint documentation. This led to architectural inconsistencies and duplicated effort when the PM changed requirements.
- **The Rule:** No code is written for a new module without a corresponding Blueprint file in `2_Blueprint/` that defines its purpose, data contracts, and risk factors. The Blueprint is the contract; the code is the implementation.

### Directive 6: RLS Authentication Assumption
- **Origin:** During a Supabase debugging session, the AI assumed that `auth.uid()` would automatically equal `cad_profiles.id`. This is only true because of the specific way the Seed Script creates accounts (it maps `auth.users.id` directly to `cad_profiles.id`).
- **The Rule:** Never assume the relationship between `auth.uid()` and `cad_id`. Always verify by checking the Seed Script logic (`scripts/bootstrap_admin_pass.js`) and the RLS policies. The mapping is: `auth.users.id = cad_profiles.id` (they are the SAME UUID, not a foreign key lookup).

### Directive 7: Multi-Replace String Matching
- **Origin:** The AI repeatedly failed when using `multi_replace_file_content` because the `TargetContent` string did not exactly match the file content (whitespace differences, trailing newlines, special characters).
- **The Rule:** When using `multi_replace_file_content`, be extremely precise with the `TargetContent` string. If the file has been modified recently or you're unsure of the exact content, use `view_file` first to get the current state, then copy the target string exactly. If the edit fails, fall back to `write_to_file` to overwrite the entire file.

---

### Directive 8: Journey-First UX Quality Gate
- **Origin:** During a deep UX audit, 38 issues were discovered that traditional code review missed — because the code worked fine technically, but the user experience was broken across journey boundaries (e.g., form sidebar navigation didn't auto-save, admin create-CAD flow had no back-link, error/info messages used identical styling).
- **The Rule:** Every code change touching UI (pages, components, layouts) MUST be validated against `2_Blueprint/12_User_Journeys.md` before being marked complete. The validation cycle is:
  1. **Update journeys** — If the feature adds/changes user flows, update `12_User_Journeys.md` first.
  2. **Walk the journey** — Read the relevant journey in the doc. For each step, verify the code does exactly what the journey says.
  3. **Check edge cases** — The journey doc includes edge cases. Verify each one.
  4. **Log any gap** — If a gap is found, log it as a finding. Fix it or document it as deferred.
- **Scope:** This applies to EVERY cycle: feature build, bug fix, refactor, audit.
- **Affected Files:** `2_Blueprint/12_User_Journeys.md` (source of truth), all `app/` and `components/` files.

### Directive 9: Consistent Loading States
- **Origin:** UX audit #3 revealed that every page handles loading differently: profile uses `<LoadingSpinner>`, dashboard shows nothing, form uses plain "Cargando formulario..." text, directory list shows nothing until data arrives. This inconsistency confuses users — they can't tell if the app is working or frozen.
- **The Rule:** ALL pages that fetch data on mount MUST use the `<LoadingSpinner>` component from `components/ui/LoadingSpinner.jsx` as their loading state. No plain text loading messages, no empty screens, no custom spinners. ONE component for ALL loading states.
- **Pattern:**
  ```jsx
  if (loading) return <LoadingSpinner message="Cargando perfil..." />;
  ```
- **Affected Files:** Every `page.jsx` under `app/(protected)/`

### Directive 10: Service Layer Exclusivity
- **Origin:** UX audit #3 found that `login/page.jsx` calls `supabase.auth.signInWithPassword()` directly instead of going through `authService`. This violates the service-layer architecture established in master-protocol §7.1.
- **The Rule:** No page or component may import or call `supabase` directly for ANY purpose. All auth operations go through `authService`, all data operations go through their respective services. The ONLY file that should import from `@/utils/supabase` is `lib/supabaseService.js` (and `hooks/useAuth.js` which predates the service refactor).
- **Future:** Move the `supabase` import in `useAuth.js` behind `authService` as well, so only `supabaseService.js` touches the raw client.

### Directive 11: Destructive Actions Need Branded Modals
- **Origin:** Both admin CAD deletion and team member removal use `window.confirm()` — the browser's native, unbranded confirmation dialog. This feels cheap, provides no safety mechanism, and is inconsistent with the warm, organic design language of the app.
- **The Rule:** Any action that permanently destroys data MUST use a branded modal component (not `window.confirm`). The modal should:
  1. Explain what will be destroyed
  2. Show the item name (so the user confirms the right thing)
  3. Require a deliberate action (button click, not a browser popup)
  4. Be cancelable with clear visual distinction between "Cancel" and "Destroy"
- **Future:** Build a reusable `<ConfirmModal>` component in `components/ui/`

### Directive 12: Active Navigation Must Match Sub-Pages
- **Origin:** The navbar uses `pathname === item.href` to determine the active link. This means when the user is on `/directory/abc-123`, the "Miembros de la red" link is NOT highlighted — because the pathname doesn't exactly match `/directory`.
- **The Rule:** Navigation active state must use `pathname.startsWith(item.href)` (with a check that `item.href !== '/'` to avoid matching everything). This way, sub-pages like `/directory/[id]` keep their parent nav item highlighted.
- **Affected File:** `components/DashboardLayout.jsx`

### Directive 13: Tests Must Map to Journeys
- **Origin:** The PM's strategic vision: user journeys are the contract, and automated tests are the machine-enforced version of the manual UX audit. Tests that don't trace back to a journey step are "orphan tests" — they test code, not user experience.
- **The Rule:** Every test file must include a comment at the top indicating which journey(s) it validates:
  ```javascript
  /**
   * Tests for Journey J5: Diagnostic Form
   * Validates: J5.1 (init), J5.3 (answering), J5.6 (submission)
   */
  ```
  The test scenarios should directly mirror the "End-to-End Test Scenarios" in `12_User_Journeys.md`.
- **Impact:** When a journey is updated, the corresponding tests are immediately identifiable for update.

### Directive 14: The Documentation IS the Product
- **Origin:** The PM's philosophy — this project is built "like IKEA furniture." The documentation (user journeys, blueprints, protocol, lessons learned) is not an afterthought; it IS the specification. Any developer (human or AI) should be able to pick up the project cold, read the docs, and build correctly without asking a single question.
- **The Rule:** When choosing between "write code faster" and "update documentation first," ALWAYS update the documentation first. The docs are the contract. The code is the implementation. If they disagree, the code is wrong.
- **Practical application:**
  1. New feature → Write the journey FIRST, then build
  2. Bug fix → Update the journey to show the correct behavior, then fix the code
  3. Refactor → Verify the journey still describes the new code accurately

---

## 📊 Lessons Log Archive

*(New entries are appended chronologically below this line)*

### [2026-03-12] - Blueprint Directory Contained Code Files
- **Mistake:** The `2_Blueprint/` directory contained `.jsx` React component prototypes and a `.csv` seed data file. These do not belong in a high-level architectural documentation folder.
- **Root Cause:** The files were created during early rapid prototyping and never properly relocated.
- **Correction:** Deleted the `.jsx` files and moved the `.csv` to `3_Product/frontend/db/seed_data.csv`.
- **New Rule:** The `2_Blueprint/` directory must ONLY contain `.md` documentation files and the `Documentos_IA/` subfolder. No code, no data files, no configs.
- **Severity:** Medium

### [2026-03-12] - Journey-First Methodology Adopted
- **Mistake:** Early UX audits reviewed code file-by-file, missing cross-boundary issues (e.g., form submission not persisted, admin flows with dead-end navigation, inconsistent loading patterns across pages).
- **Root Cause:** Audits were code-centric, not user-centric. A file can look correct in isolation while the journey it participates in is broken.
- **Correction:** Adopted journey-first auditing: (1) Document every user flow in `12_User_Journeys.md`, (2) Walk each journey step-by-step against source code, (3) Log every deviation as a finding.
- **New Rule:** See Directive 8 above. This cycle (journeys → audit → fix → re-audit) is now the standard for all UI work.
- **Severity:** High

### [2026-03-12] - UX Audit Round 1: 6 Flow Breakers Fixed
- **Mistake:** The app had 6 critical flow breakers: (F1) form submission not persisted, (F2) dashboard same for admin/CAD, (F3) conditional questions never hidden, (F4) block IDs skipping 3→5, (F5) placeholder info text, (F6) no beforeunload on form.
- **Root Cause:** Original development focused on getting features working technically, without walking through the complete user journey end-to-end.
- **Correction:** All 6 breakers fixed in a single batch: `submitted_at` persistence, conditional admin card, Q0.2 conditional rendering, sequential block renumbering (0-7), actual info descriptions replacing placeholders, `beforeunload` handler added to form.
- **New Rule:** Before any UI feature is considered "done," the developer MUST complete the full user journey that the feature participates in — login to logout — at least once.
- **Severity:** Critical

### [2026-03-12] - UX Audit Round 2: 20 Additional Fixes
- **Mistake:** After fixing the 6 critical breaks, 14 UX gaps and 6 polish items remained across all journeys.
- **Root Cause:** First audit focused on breakers. Second audit expanded to all friction points.
- **Correction:** Fixed 20 items including: password confirm field (G7), search clear button (G9), empty results CTA (G10), login error colors (G12), profile loading spinner (G13), logo upload validation (P4), last-saved timestamp (P9), mobile scroll fade (P10), form success "Volver" button, dev fast-login route fix.
- **New Rule:** Audits are iterative. One pass is never enough. The standard is: 0 breakers, <5 gaps, all gaps documented.
- **Severity:** High

### [2026-03-12] - UX Audit Round 3: All Breakers Eliminated
- **Mistake:** None — this was a verification audit.
- **Root Cause:** N/A
- **Correction:** Confirmed all 6 previous breakers resolved. Found 38 remaining items (17 gaps, 21 polish). None prevent task completion.
- **New Rule:** Every major fix batch must be followed by a full re-audit to verify fixes and catch regressions.
- **Severity:** Medium
