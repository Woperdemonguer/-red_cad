---
Title: Engineering_Standards
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Technical Standards & Code Patterns
  Dependencies: [.agent/workflows/master-protocol.md, .agent/core/lessons_learned.md]
  Related_Code: [3_Product/frontend/*]
---

# 📐 Engineering Standards Reference

> **For the human PM:** This is the "technical building code." It defines the tech stack, design language, code architecture, database rules, testing strategy, tooling, and documentation standards. Developers refer to this when they need to know HOW to build things correctly.
>
> **For the AI Agent:** This is your reference manual. Read it when working on code, database, or architecture tasks. The behavioral rules are in `master-protocol.md`; this contains the technical details.

---

# Part III — The Technology Stack (Ground Truth)

## 5. The Exact Stack

This section is the definitive reference. If any Blueprint document contradicts this section, THIS section is correct.

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js (App Router) | 14.2.3 | Server Components by default. `"use client"` only when needed. |
| **Language** | JavaScript (JSX) | ES2022+ | No TypeScript in the codebase (yet). TS interfaces in Blueprints are for documentation only. |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first. No CSS Modules. Custom tokens in `tailwind.config.js`. |
| **Backend** | Supabase | 2.99.0 | PostgreSQL + Auth + Storage. All in one. |
| **Icons** | Lucide React | 0.359.0 | The ONLY icon library. Do not introduce others. |
| **Toasts** | react-hot-toast | 2.6.0 | Global `<ToastProvider>` in root `layout.jsx`. |
| **Testing** | Vitest + Testing Library + jsdom | 4.0.x / 16.x / 28.x | `npm run test` for one-shot, `npm run test:watch` for development. |
| **Deployment** | Vercel | — | Auto-deploy on push to `main`. Preview URLs for PRs. |
| **Font** | Nunito (Google Fonts) | — | Loaded via `<link>` in root `layout.jsx`. Configured as `fontFamily.sans` in Tailwind. |
| **Parsing** | `xlsx` | (to be installed) | For POD Excel import. Client-side reading. |

---

# Part IV — Design Methodology

## 6. The Design Language

### 6.1. Color System (From `tailwind.config.js`)

| Token | Hex | CSS Class | Usage |
|-------|-----|-----------|-------|
| `forest` | `#2E5339` | `bg-forest`, `text-forest` | Primary buttons, headers, active nav states |
| `forestLight` | `#3c6b4a` | `bg-forestLight` | Hover state for forest elements |
| `sage` | `#8BAA7C` | `text-sage` | Secondary text, tags, badges |
| `cream` | `#FFFFFF` | `bg-cream` | Card backgrounds (currently mapped to white) |
| `sand` | `#F5F7FA` | `bg-sand` | Page backgrounds, sidebar fills |
| `border` | `#E2E8F0` | `border-border` | All borders and dividers |
| `text` | `#1A202C` | `text-text` | Primary body text |
| `textLight` | `#718096` | `text-textLight` | Secondary/muted text |
| `warmGray` | `#A0AEC0` | `text-warmGray` | Placeholder text, disabled states |
| `accent` | `#E8A923` | `bg-accent` | CTA buttons, highlights, badges |
| `accentHover` | `#D49A1A` | `hover:bg-accentHover` | CTA hover state |
| `accentLight` | `#FEF3D1` | `bg-accentLight` | Accent background fills (notifications) |
| `red` | `#C53030` | `text-red` | Error states, destructive actions |
| `blueBg` | `#D6E4F0` | `bg-blueBg` | Informational backgrounds |
| `blueBgLight` | `#EBF0F7` | `bg-blueBgLight` | Subtle info backgrounds |

> **Rule:** ALWAYS use the semantic token name (`text-forest`, `bg-sand`). NEVER use raw hex values in JSX. The tokens are the contract. If the PM changes the color palette, only `tailwind.config.js` needs to change.

### 6.2. Typography
- **Font Family:** Nunito (sans-serif) — loaded via Google Fonts in the root `<head>`.
- **Tailwind config:** Both `fontFamily.sans` and `fontFamily.serif` are mapped to Nunito. This means `font-sans` and `font-serif` both render Nunito. This is intentional for consistent branding.
- **Headings:** `font-bold` or `font-semibold` + appropriate size (`text-2xl`, `text-xl`, etc.).
- **Body:** Regular weight, `text-text` color, `text-base` size.

### 6.3. Animation System (From `tailwind.config.js`)
Two custom animations are registered:
```css
animate-fade-in  → opacity 0→1 over 0.5s ease-out
animate-slide-up → translateY(10px)→0 + opacity 0→1 over 0.5s ease-out
```
Use `animate-fade-in` on page-level containers and `animate-slide-up` on individual cards when building list views for a staggered entrance effect.

### 6.4. Design Principles
1. **Warmth over Corporate.** The platform serves agricultural cooperatives. It must feel organic, approachable, and human. Avoid sterile whites and sharp corners. Use rounded corners (`rounded-xl`, `rounded-2xl`), warm shadows (`shadow-lg`), and the green/gold palette.
2. **Clarity over Decoration.** Every page must answer "What am I supposed to do here?" within 3 seconds. Use clear headings, spacious layouts, and prominent CTA buttons.
3. **Progressive Disclosure.** Don't overwhelm users with all options at once. Use collapsible sections, tabs, and conditional visibility (like Question 0.2 only showing when 0.1 is "No").
4. **Accessibility.** All interactive elements must be keyboard-navigable. Color contrast must meet WCAG AA standards. Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`).

### 6.5. Component Design Patterns
- **Cards:** `bg-white rounded-2xl shadow-lg p-6 border border-border` — the standard card treatment.
- **Primary Buttons:** `bg-accent text-text px-6 py-3 rounded-lg hover:bg-accentHover transition-colors font-bold`.
- **Secondary Buttons:** `border border-forest text-forest px-4 py-2 rounded-lg hover:bg-forest hover:text-white transition-colors`.
- **Page Headers:** `text-2xl font-bold text-text mb-6` inside a `<main className="p-6 max-w-7xl mx-auto">`.

---

# Part V — Engineering Methodology

## 7. Codebase Architecture Rules

### 7.1. The Separation of Concerns (MVC without the V-C confusion)

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  components/  │  │    hooks/     │  │       config/        │  │
│  │  (The View)   │  │ (The Ctrl)   │  │ (The Static Data)    │  │
│  │  Renders JSX  │  │ State Logic  │  │ Questions, Options   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                  │                                     │
│         └──────────────────┘                                     │
│                    │                                             │
│         ┌─────────▼─────────┐                                   │
│         │ lib/supabaseService│  ← The Data Access Layer (DAL)   │
│         │ (The Model)        │    profileService.get()           │
│         │ 4 service objects  │    formService.save()             │
│         └─────────┬─────────┘    teamService.add()              │
│                   │              storageService.uploadLogo()     │
└───────────────────┼─────────────────────────────────────────────┘
                    │
          ┌─────────▼─────────┐
          │  Supabase Cloud    │
          │  PostgreSQL + Auth │
          │  + Storage         │
          └────────────────────┘
```

**The iron-clad rule:** Pages and Components NEVER call `supabase.from()` directly. They ALWAYS go through `lib/supabaseService.js`.

### 7.2. The Service Layer Architecture (From `supabaseService.js`)

| Service | Functions | DB Table(s) |
|---------|-----------|-------------|
| `profileService` | `.get(cadId)`, `.list()`, `.listForAdmin()`, `.update(cadId, data)`, `.create(name)`, `.delete(cadId)`, `.resolveEmail(cadId)` | `cad_profiles` |
| `formService` | `.load(email)`, `.save(email, answers)`, `.resolveEmail(cadId)` | `diagnostic_forms`, `cad_users_mapping`, `cad_profiles` |
| `teamService` | `.listForCad(cadId)`, `.listAdmins()`, `.add(isAdmin, member, cadId)`, `.update(isAdmin, memberId, updates)`, `.remove(isAdmin, memberId)` | `cad_users_mapping`, `admin_users_mapping` |
| `storageService` | `.uploadLogo(cadId, file)` | Supabase Storage `cad_media` bucket |

### 7.3. The Authentication Architecture (From `useAuth.js`)

The `useAuth()` hook is the SINGLE SOURCE OF TRUTH. On mount: `getSession()` → if session → 3 parallel queries (`user_roles`, `admin_users_mapping`, `cad_users_mapping`) → resolves `{ user, email, isAdmin, cadId, loading, signOut }`.

Admin detection uses TWO sources (`user_roles` OR `admin_users_mapping`).

### 7.4. The Protected Layout Architecture

```text
app/layout.jsx          → Root layout (html, body, Toasts, fonts)
  └── app/(protected)/layout.jsx → Protected wrapper
        ├── DashboardLayout     → The top navbar
        └── ErrorBoundary       → Catches render crashes
              └── {children}    → The actual page
```

---

## 8. File-Level Conventions

### 8.1. File Naming

| Type | Convention | Example |
|------|-----------|---------| 
| Pages | `page.jsx` (Next.js) | `app/(protected)/form/page.jsx` |
| Components | PascalCase `.jsx` | `components/ErrorBoundary.jsx` |
| Hooks | camelCase with `use` prefix `.js` | `hooks/useAuth.js` |
| Config | camelCase `.js` | `config/diagnosticForm.js` |
| Server Actions | camelCase `.js` | `app/actions/adminAuth.js` |
| Service Layer | camelCase `.js` | `lib/supabaseService.js` |

### 8.2. Import Order: React/Next → Third-Party → Internal Services → Components → Config

### 8.3. The `"use client"` Directive
Only add when the component needs: event handlers, React Hooks, or Browser APIs.

---

# Part VI — Database & Supabase Methodology

## 9. Database Golden Rules

### 9.1. Schema Architecture
`auth.users` → mapped via `user_roles`, `cad_users_mapping`, `admin_users_mapping` → `cad_profiles` (central nexus) → `products`, `diagnostic_forms`, `prices_availability`

### 9.2. JSONB: The Architectural Superpower
`madurez_evaluacion` and `intercoop_tecnica` are flexible JSONB bags. Adding a new dimension = 5 min (edit config). Traditional column = 1-2 hours.

### 9.3. Row Level Security (RLS)
Default Deny. `cad_profiles` readable by all auth users. `diagnostic_forms` only by the owner or Admin. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — used ONLY in Server Actions.

### 9.4. SQL Safety
Idempotent migrations (`IF NOT EXISTS`). No raw `DELETE` without `WHERE`. Foreign key integrity. The Silent Field-Drop Bug = always update SQL + service + React in lockstep.

### 9.5. Authentication
Password-only. Admin-created accounts. No self-registration.

---

# Part VII — Testing Methodology

## 10. The Testing Pyramid

| Priority | What | How |
|:--------:|------|-----|
| **P0** | Data transformations, service layer | Unit tests (Vitest) |
| **P1** | Component rendering, conditional form logic | Snapshot/interaction tests |
| **P2** | Full user flows | Browser tests |
| **P3** | Build verification | `npm run build` |

Test files live next to the code. Use `describe()` blocks named after the module.

---

# Part VIII — Tool Mastery

## 11. AI Tool Usage Best Practices

| Tool | When to Use |
|------|-------------|
| `write_to_file` | Creating new files, rewriting entire files |
| `replace_file_content` | Surgical single-block edits |
| `view_file` | ALWAYS before editing |
| `grep_search` | Finding all usages before renaming |

Commands: `npm run lint/build/test` are safe to auto-run. `mv/rm/npm install` require approval.

---

# Part IX — Documentation Standards

## 12. Every Blueprint file MUST contain:
YAML frontmatter (`Title`, `Status`, `AI_Context`) + Human Translation + Technical Purpose + Content.

## 13. When to Update:
New DB column → Schema Blueprint. New route → Architecture doc. Architectural shift → `10_Architecture_Update_Log.md`. PM correction → `lessons_learned.md`.
