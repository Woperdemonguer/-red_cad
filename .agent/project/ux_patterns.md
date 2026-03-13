---
Title: UX_Patterns_Reference
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: UX Patterns, Components & State Management
  Dependencies: [.agent/workflows/master-protocol.md, .agent/core/lessons_learned.md, 2_Blueprint/12_User_Journeys.md]
  Related_Code: [3_Product/frontend/components/*, 3_Product/frontend/hooks/*, 3_Product/frontend/app/*]
---

# 🎨 UX Patterns Reference

> **For the human PM:** This is the "pattern library." Every component, error treatment, state management rule, and responsive design decision is documented here. When a developer asks "how should I show an error?" or "what does the LoadingSpinner look like?" — this document answers.
>
> **For the AI Agent:** Read this when building/modifying UI components, adding error handling, managing state, or working on mobile responsiveness.

---

# Part XII — The Journey-to-Test Bridge

## 16. Tests Are Automated Journeys

Every test maps to a specific journey step. Tests that don't trace back to a journey are "orphan tests."

### Test File Header Convention
```javascript
/**
 * @journey J5 — Diagnostic Form
 * @covers  J5.1 (Form Initialization), J5.3 (Answering Questions), J5.6 (Submission)
 * @file    app/(protected)/form/page.jsx
 * @audit   UX Audit #3 findings: #21, #22, #23, #24
 */
```

### Journey-to-Test Mapping

| Journey | Test Type | What to Test |
|---------|-----------|-------------|
| **J1: Authentication** | Unit + Integration | `signInWithPassword`, error states, redirect, session check |
| **J2: Dashboard** | Snapshot + Unit | Correct cards for CAD vs Admin, links |
| **J3: Navigation** | Unit | Active state (`startsWith`), mobile menu, admin link visibility |
| **J4: Profile** | Integration | Data load, field binding, save, logo validation |
| **J5: Form** | Integration + E2E | Block nav, answer persistence, conditional Q's, progress, submission |
| **J6: Directory** | Unit + Integration | Filters, card rendering, detail page, tabs |
| **J7: Admin** | Integration + E2E | Access denied, CAD table, create → redirect, password reset, delete |

### Test Priority Order

| Priority | Type | Journey Coverage |
|:--------:|------|-----------------|
| **P0** | Service layer unit tests | All services |
| **P0** | Auth hook tests | J1 |
| **P1** | Form logic tests | J5 |
| **P1** | Admin actions tests | J7 |
| **P2** | Component render tests | J2–J4, J6 |
| **P3** | E2E browser tests | Full journeys |

---

# Part XIV — The Component Library (Ground Truth)

## 18. Component Inventory

### 18.1. Layout Components

| Component | File | Purpose | Used By |
|-----------|------|---------|---------| 
| `DashboardLayout` | `components/DashboardLayout.jsx` | Top navbar (desktop + mobile sidebar), user context, navigation | `app/(protected)/layout.jsx` |
| `ErrorBoundary` | `components/ErrorBoundary.jsx` | Catches render crashes, shows friendly Spanish fallback | `app/(protected)/layout.jsx` |
| `ToastProvider` | `components/ToastProvider.jsx` | Configures global `react-hot-toast` Toaster | `app/layout.jsx` |

#### DashboardLayout Behavior
- **Auth:** `useAuth()` → renders nav links, email, logout. Shows admin link only when `isAdmin=true`
- **Desktop:** Sticky top header with centered nav + right-side user area
- **Mobile:** Hamburger → slide-out right sidebar (w-64) with dark overlay
- **Active link:** `pathname === item.href` (⚠️ should migrate to `startsWith`)
- **Breakpoint:** `lg:` (1024px) separates desktop from mobile

#### ErrorBoundary Behavior
- React class component. Fallback: ⚠️ emoji + Spanish text + "Recargar página" button.
- Dev mode: shows `error.toString()` in red pre block.
- Recovery: `window.location.reload()`

#### ToastProvider Configuration
```javascript
{
    position: "top-center",
    duration: 3000,
    style: { background: '#1A202C', color: '#fff', fontSize: '14px', borderRadius: '10px' },
    success: { duration: 3000, background: '#2E5339' (forest) },
    error: { duration: 4000, background: '#C53030' (red) }
}
```
⚠️ Hardcoded hex (react-hot-toast API requires JS objects, not Tailwind classes).

### 18.2. Shared UI Components

| Component | File | Purpose | Props |
|-----------|------|---------|-------|
| `LoadingSpinner` | `components/ui/LoadingSpinner.jsx` | Unified loading indicator | `size` (sm/md/lg), `message` |
| `TeamMemberList` | `components/TeamMemberList.jsx` | CRUD for team members | `members`, `onMembersChange`, `isAdmin`, `cadId`, `title`, `subtitle`, `addLabel` |

#### LoadingSpinner Sizes
| Size | Use Case | CSS |
|:----:|----------|-----|
| `sm` | Inline/button | `h-5 w-5 border-b-[1.5px]` |
| `md` | Page-level (default) | `h-8 w-8 border-b-2` |
| `lg` | Full-screen | `h-12 w-12 border-b-2` |

**Rule:** ALL data-fetching pages MUST use this component. See Directive 9.

### 18.3. Form Question Components

| Component | Type | Key Features |
|-----------|:----:|--------------|
| `RadioQuestion` | `radio` | Single select, `hasOther` free-text, `hasComment` |
| `CheckboxQuestion` | `checkbox` | Multi-select, `hasOther`, `hasComment` |
| `TextQuestion` | `textarea` | Free-text input |
| `InfoQuestion` | `info` | Read-only informational text |
| `MatrixQuestion` | `matrix` | Grid: categories × rating levels |

#### Common Props Interface
```javascript
{ question: { id, q, options, hasOther, hasComment }, value, onChange, comment, onCommentChange }
```

#### The "Otro" Pattern
Value stored as `"otro:user text here"` — the `otro:` prefix distinguishes free-text from predefined options.

### 18.4. Components That Don't Exist Yet (Planned)

| Component | Priority | Purpose |
|-----------|:--------:|---------|
| `ConfirmModal` | 🔴 High | Branded confirmation for destructive actions |
| `SkeletonLoader` | 🟡 Medium | Shimmer placeholders during data fetch |
| `Breadcrumbs` | 🟢 Low | Navigation trail for sub-pages |
| `EmptyState` | 🟡 Medium | Reusable empty results component |

---

# Part XV — Error Handling & Feedback Patterns

## 19. The Error Hierarchy

```text
Level 1: CRASH        → ErrorBoundary → friendly fallback page
Level 2: PAGE ERROR   → Inline error banner → retry or navigate
Level 3: ACTION ERROR → Toast (red) → disappears after 4s
Level 4: VALIDATION   → Inline field error → guides user
```

### 19.1. When to Use Each Pattern

| Level | Pattern | Style | Duration |
|:-----:|---------|-------|:--------:|
| 1 | Crash fallback | Full-page card with ⚠️ | Persistent |
| 2 | Error banner | Red icon + text + "Volver" link | Persistent |
| 3 | Error toast | Red bg, white text | 4 seconds |
| 3 | Success toast | Forest bg, white text | 3 seconds |
| 4 | Field validation | Red text below field | Until corrected |

### 19.2. Error Color Coding

| Context | Tailwind |
|---------|----------|
| Error | `bg-red/5 border-red text-red` |
| Info | `bg-blueBgLight border-accent text-text` |
| Success | `bg-forest text-white` or `text-forest` |
| Warning | `bg-accentLight text-accent` |

---

# Part XVI — State Management Patterns

## 20. State Architecture

| Category | Where | Examples |
|----------|-------|----------|
| **Auth state** | `useAuth()` hook | `user`, `email`, `isAdmin`, `cadId` |
| **Page state** | `useState()` in page | `profile`, `loading`, `error`, `isDirty` |
| **Form state** | `useState()` in form | `answers{}`, `currentBlock`, `hasUnsavedChanges` |
| **UI state** | `useState()` locally | `isMobileMenuOpen`, `editingMemberId`, `activeTab` |
| **Server state** | Supabase DB | Profiles, forms, team members (source of truth) |

### 20.1. State Rules
1. No prop drilling beyond 2 levels → extract to hook/context
2. No global state library (no Redux/Zustand) — `useState` + `useAuth()` is sufficient
3. Database is the source of truth — local state is a cache
4. Dirty tracking required on pages with saves (`beforeunload`)

### 20.2. The `useAuth()` Contract

```javascript
const { user, email, isAdmin, cadId, loading, signOut } = useAuth();
```

| Field | Type | Notes |
|-------|------|-------|
| `user` | Object | Supabase auth user |
| `email` | String | `user.email` |
| `isAdmin` | Boolean | Dual-source check |
| `cadId` | UUID \| null | Null for admins without CAD |
| `loading` | Boolean | True during resolution |
| `signOut` | Function | Signs out + redirects |

---

# Part XVII — Responsive Design & Mobile Rules

## 21. Breakpoint System

| Breakpoint | Size | Usage |
|:----------:|:----:|-------|
| (default) | <640px | Mobile phone |
| `sm:` | ≥640px | Large phone / small tablet |
| `md:` | ≥768px | Tablet |
| **`lg:`** | **≥1024px** | **Desktop — primary break** |
| `xl:` | ≥1280px | Wide desktop |

### 21.1. Mobile-First Rules
1. Write mobile styles first, add `lg:` overrides
2. Grids: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`
3. Touch targets ≥ 44px (`py-3 px-4` minimum)
4. No horizontal scroll (except form sidebar)
5. Safe area padding for notched phones: `env(safe-area-inset-bottom)`

### 21.2. Page Layout Pattern
```jsx
<div className="p-4 lg:p-8 max-w-7xl mx-auto">{/* Content */}</div>
```

### 21.3. Navigation Responsive Behavior

| Element | Mobile | Desktop |
|---------|:------:|:-------:|
| Nav links | In sidebar | Horizontal row |
| Hamburger | Visible | Hidden |
| User email | Sidebar footer | Header right |
| Logout | Full-width red | Pill button |
| Logo | Always visible | Always visible |
