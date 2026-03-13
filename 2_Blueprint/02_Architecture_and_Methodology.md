---
Title: 02_Architecture_and_Methodology
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Application Architecture & Coding Rules
  Dependencies: [01_Intranet_Project_Plan.md]
  Related_Code: [3_Product/frontend/app/*, 3_Product/frontend/components/*, 3_Product/frontend/lib/*, 3_Product/frontend/config/*]
  Core_Entities: []
---

# 🏗️ RedCAD Hub: Engineering Architecture & Methodology

## 🧑‍💼 The Human Translation
> **What is this document?**
> Think of this as the "Building Code" and "Zoning Laws" for our digital city. Just like a real city requires standardized plumbing and electrical rules so that different contractors can build houses safely without things catching fire, this document tells software engineers (and AI bots) exactly *how* they are allowed to write code.
>
> **Key concepts in simple terms:**
> - **"Component-Driven"** means we build Lego pieces (buttons, menus, cards) once, and reuse them everywhere instead of building from scratch each time. If 5 pages need a "Save" button, we build ONE Save button component and put it in 5 places.
> - **"Separation of Concerns"** means the paint (UI) doesn't mix with the plumbing (Database). The file that draws a pretty card on screen should NOT be the same file that talks to the database. They communicate through clean interfaces.
> - **"Server Actions"** are like a secure back door. Instead of the user's browser talking directly to the database (risky!), the browser talks to a secure middleman (the server) who then talks to the database on the user's behalf.

---

> **Technical Purpose:** Establishes foundational rules, scalable code architecture, and engineering methodology for the RedCAD Hub web application. Serves as the definitive coding rulebook that both AI agents and human developers must follow.

---

## 🤖 1. Strict AI & Developer Coding Rules

As we scale this from an MVP to a full enterprise-grade application for 16+ CADs, we must follow a strict engineering methodology. **AIs MUST review this section before writing any code.**

### 1.1. The Engineering Commandments
1. **Blueprint First:** Before coding any Module, we define its precise requirements in the `2_Blueprint` directory. No code is written without a blueprint defining its data contracts and UI flow.
2. **Component-Driven Development:** We do not build monolithic pages. We build atomized components in `components/ui/` (generic) or `components/modules/` (feature-specific) and import them into pages.
3. **Tailwind Mastery:** Use Tailwind utility classes exclusively. Do not create `.module.css` files unless overriding a third-party library's styles. The color palette tokens are defined in `tailwind.config.js` — use semantic names (`text-forest`, `bg-cream`), not raw hex values.
4. **Separation of Concerns:**
   - **UI (View):** React Components (`.jsx` files in `components/` and `app/`). Handle rendering and user interaction.
   - **Logic (Controller):** Custom React Hooks (`hooks/`) and utility functions (`utils/`). Handle state transformations and business rules.
   - **Data (Model):** Next.js Server Actions (`app/actions/`) and Supabase service layers (`lib/supabaseService.js`). Handle all database communication.
5. **Config Extraction:** If a static data array exceeds 5 items (dropdown options, form questions, navigation links, color tokens, etc.), it MUST be extracted to a file in `config/` and imported. This keeps components clean and enables non-developers to edit content.
6. **Learn-As-We-Go:** Every major code architecture shift MUST be logged in `10_Architecture_Update_Log.md` using the standardized ripple-effect format. Every AI correction must be logged in `.agent/core/lessons_learned.md`.

### 1.2. File Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.jsx` (Next.js convention) | `app/(protected)/form/page.jsx` |
| Components | PascalCase | `components/ui/Button.jsx` |
| Hooks | camelCase with `use` prefix | `hooks/useAuth.js` |
| Config | camelCase | `config/diagnosticForm.js` |
| Server Actions | camelCase | `app/actions/adminAuth.js` |
| Lib Services | camelCase | `lib/supabaseService.js` |
| SQL Scripts | snake_case | `db/supabase_profile_expansion.sql` |

### 1.3. Import Order Convention
```javascript
// 1. React and Next.js core
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { createClient } from '@supabase/supabase-js';
import { FileUp, Save } from 'lucide-react';

// 3. Internal libs and hooks
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// 4. Internal components
import { Button } from '@/components/ui/Button';
import { ProfileCard } from '@/components/modules/ProfileCard';

// 5. Config and constants
import { diagnosticFormConfig } from '@/config/diagnosticForm';
```

---

## 🗂️ 2. Scalable Codebase Structure (Next.js App Router)

The application lives in `3_Product/frontend`. Here is the architecture designed for maximum scalability and clarity:

```text
frontend/
├── app/                           # THE APP ROUTER (Pages & Routing)
│   ├── (auth)/                    # Public routes (no auth required)
│   │   └── login/
│   │       └── page.jsx           # The login form (email + password)
│   ├── (protected)/               # Protected routes (auth required)
│   │   ├── dashboard/
│   │   │   └── page.jsx           # Module 0: Network overview
│   │   ├── form/
│   │   │   └── page.jsx           # Module 1: 63-question diagnostic
│   │   ├── profile/
│   │   │   └── page.jsx           # Module 1.5: CAD identity editor
│   │   ├── directory/
│   │   │   └── page.jsx           # Module 3: Network directory
│   │   ├── catalog/
│   │   │   └── page.jsx           # Module 4: Global product catalog
│   │   ├── import/
│   │   │   └── page.jsx           # Module 2: POD Excel uploader
│   │   ├── admin/
│   │   │   └── page.jsx           # Module 8: Admin control panel
│   │   └── layout.jsx             # The global navbar wrapper (shared across all protected pages)
│   ├── actions/                   # NEXT.JS SERVER ACTIONS (Secure Backend Operations)
│   │   ├── adminAuth.js           # Admin password management, user minting
│   │   └── importData.js          # POD Parser → Supabase injection
│   ├── layout.jsx                 # Root layout (wraps the entire app)
│   └── globals.css                # Tailwind base + custom utility classes
│
├── components/                    # REUSABLE UI LEGO BLOCKS
│   ├── ui/                        # Generic, context-free components
│   │   ├── Button.jsx             # Standardized button with variants
│   │   ├── Card.jsx               # Reusable card container
│   │   └── Input.jsx              # Form input with validation styles
│   ├── layout/                    # Structural layout components
│   │   ├── DashboardLayout.jsx    # The top navbar + page container
│   │   └── ErrorBoundary.jsx      # Graceful error catching
│   └── modules/                   # Feature-specific complex components
│       ├── ImportDropzone.jsx     # Drag-and-drop file upload area
│       └── DataPreviewTable.jsx   # Parsed data preview before DB injection
│
├── hooks/                         # CUSTOM REACT HOOKS
│   └── useAuth.js                 # Authentication state and user context
│
├── lib/                           # BUSINESS LOGIC & UTILITIES
│   ├── supabase/                  # Database connection clients
│   │   ├── client.js              # Browser-side Supabase client (anon key)
│   │   └── server.js              # Server-side Supabase client (service role key)
│   ├── supabaseService.js         # CRUD operations organized by entity (profileService, formService, etc.)
│   └── parsers/                   # Data transformation logic
│       └── podParser.js           # Excel column mapping and normalization
│
├── scripts/                       # ONE-TIME SETUP SCRIPTS
│   ├── bootstrap_admin_pass.js    # Creates admin accounts via service role key
│   ├── add_shared_admin.js        # Adds additional admin users
│   └── check_user.js              # Debug utility to inspect auth.users
│
├── db/                            # SQL SCRIPTS & SEED DATA
│   ├── seed_data.csv              # Initial CAD data for the pilot (3 CADs)
│   ├── rpc_get_user_id.sql        # Supabase RPC function for user lookup
│   └── supabase_profile_expansion.sql  # Column migration script
│
└── config/                        # EXTRACTED CONFIGURATION OBJECTS
    ├── diagnosticForm.js          # All 63 questions, intros, options, and conditional logic
    └── profileOptions.js          # Dropdown options for the profile editor
```

> **AI Note:** When adding a new module, create the route folder first (`app/(protected)/[module-name]/page.jsx`), then build the components in `components/modules/`, then update this tree diagram.

---

## 💾 3. Database Architecture (Supabase)

Supabase handles our PostgreSQL database, Authentication, and file Storage.

### 3.1. The Complete Table Map

```text
┌──────────────────────┐
│    auth.users        │  ← Supabase-managed (email, password, UUID)
│    (Supabase Auth)   │
└──────────┬───────────┘
           │ id = id (1:1 mapping)
           ▼
┌──────────────────────┐
│    cad_profiles      │  ← The central nexus (identity, maturity, contact)
│    (Network-visible) │
└──────────┬───────────┘
           │ cad_id = id
    ┌──────┼──────┐
    ▼      ▼      ▼
┌────────┐ ┌──────────────┐ ┌────────────────────┐
│products│ │diagnostic_   │ │prices_availability │
│(Dict.) │ │forms (Private│ │(CAD-specific offer)│
└────────┘ └──────────────┘ └────────────────────┘
    │                              │
    └──────── product_id ──────────┘
```

### 3.2. Core Architecture Rules
1. **Row Level Security (RLS) is Mandatory:** No user can read or write data that doesn't belong to their `cad_id` unless explicitly permitted (like the Public Global Catalog and Directory).
2. **Relational Integrity:** We use strict Foreign Keys. `cad_id` must validly point back to `cad_profiles.id`. `product_id` in `prices_availability` must point to `products.id`.
3. **Admin Bypass via Service Key:** Administrator server actions safely bypass RLS to manage all CADs using secure server-side logic and the `SUPABASE_SERVICE_ROLE_KEY`. This key is NEVER exposed to the client.
4. **JSONB for Dynamic Data:** Columns like `madurez_evaluacion` use JSONB to store flexible key-value pairs, allowing the PM to add new metrics without SQL migrations.
5. **Idempotent Migrations:** All SQL scripts use `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, or `DO $$ BEGIN ... EXCEPTION ... END $$;` to be safely runnable multiple times.

---

## 🧪 4. Testing and Deployment Strategy

### 4.1. Quality Gates
| Gate | Tool | When to Run |
|------|------|-------------|
| **Linting** | `npm run lint` | After every code change, before committing |
| **Build Check** | `npm run build` | Before marking any implementation task as complete |
| **Visual QA** | Browser tool / Manual | After any UI change |
| **RLS Verification** | Supabase Dashboard → SQL Editor | After any new RLS policy |

### 4.2. Deployment Pipeline
1. Developer pushes to `main` branch on GitHub.
2. Vercel detects the push and triggers an automatic build.
3. If the build succeeds, the new version is deployed to the production URL.
4. Preview URLs are generated for Pull Requests, enabling testing before merge.

### 4.3. Environment Variables
| Variable | Location | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | The Supabase project URL (public, safe for client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | The Supabase anonymous key (public, safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | **CRITICAL: SERVER-ONLY.** Bypasses RLS. Must NEVER be in client-side code. |
