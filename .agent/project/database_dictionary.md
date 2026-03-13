---
Title: Database_Dictionary_and_Environment
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Database Schema & Deployment
  Dependencies: [.agent/workflows/master-protocol.md, .agent/core/lessons_learned.md]
  Related_Code: [3_Product/frontend/lib/supabaseService.js, 3_Product/frontend/app/actions/adminAuth.js]
  Core_Entities: [cad_profiles, diagnostic_forms, cad_users_mapping, admin_users_mapping, user_roles]
---

# 🗄️ Database Dictionary & Environment Reference

> **For the human PM:** This is the "data dictionary" — every field in every table, every environment variable, and every Supabase-specific trap to avoid.
>
> **For the AI Agent:** Read this when working on database queries, adding columns, modifying the service layer, or configuring deployments.

---

# Part XVIII — The Database Field Dictionary

## 22. Table Reference

### 22.1. `cad_profiles` — The Central Nexus

| Column | Type | Nullable | Purpose | Service Path |
|--------|:----:|:--------:|---------|:------------:|
| `id` | UUID (PK) | No | Primary key. Matches `auth.users.id` | `profileService.get(id)` |
| `nombre_comercial` | text | Yes | Display name of the CAD | `.list()`, `.listForAdmin()` |
| `descripcion_corta` | text | Yes | Short description for directory | `.get()` |
| `territorio` | text | Yes | Geographic region | `.list()`, Directory filter |
| `email_contacto` | text | Yes | Public contact email | `.get()` |
| `telefono` | text | Yes | Public phone number | `.get()` |
| `ano_constitucion` | integer | Yes | Founding year | `.get()` |
| `num_socios_productoras` | integer | Yes | Number of member producers | `.get()` |
| `num_personas_trabajadoras` | integer | Yes | Number of workers | `.get()` |
| `forma_juridica` | text | Yes | Legal form | `.get()` |
| `tipo_gobernanza` | text | Yes | Governance model | `.get()` |
| `propiedad_instalaciones` | text | Yes | Facility ownership | `.get()` |
| `estado` | text | Yes | Activo/Inactivo/Satélite | `.listForAdmin()` |
| `grupo_motor` | text | Yes | "Sí"/"No" — Motor Group | Directory badge |
| `perfiles_equipo` | JSONB | Yes | Team profile categories | `.get()` |
| `madurez_evaluacion` | JSONB | Yes | Traffic-light scores: `{"Logística": "🟡"}` | `.get()`, Profile matrix |
| `madurez_fortalezas` | text | Yes | Biggest strengths | `.get()` |
| `madurez_cuellos_botella` | text | Yes | Biggest challenges | `.get()` |
| `intercoop_compartir` | JSONB | Yes | Areas this CAD can teach | `.get()` |
| `intercoop_apoyo_necesario` | JSONB | Yes | Areas this CAD needs help | `.get()` |
| `intercoop_disposicion` | text | Yes | Willingness to cooperate | `.get()` |
| `intercoop_referentes` | text | Yes | Technical contacts | `.get()` |
| `logo_url` | text | Yes | Public URL of uploaded logo | `storageService.uploadLogo()` |
| `datos_adicionales` | JSONB | Yes | Dynamic catch-all for future fields | `.get()` |

### 22.2. `diagnostic_forms`

| Column | Type | Nullable | Purpose |
|--------|:----:|:--------:|---------|
| `user_email` | text (PK) | No | Email associated with this form |
| `answers` | JSONB | Yes | All answers: `{ "0.1": "Sí", ..., "submitted_at": "ISO" }` |

### 22.3. Mapping Tables

#### `cad_users_mapping`
| Column | Type | Purpose |
|--------|:----:|---------|
| `id` | UUID (PK) | Row identifier |
| `cad_id` | UUID (FK → cad_profiles) | Which CAD |
| `user_email` | text | Login email |
| `nombre_persona` | text | Full name |
| `perfil_rol` | text | Role/position |
| `telefono` | text | Phone |

#### `admin_users_mapping`
| Column | Type | Purpose |
|--------|:----:|---------|
| `id` | UUID (PK) | Row identifier |
| `user_email` | text | Admin's login email |
| `nombre_persona` | text | Full name |
| `perfil_rol` | text | Role |
| `telefono` | text | Phone |
| `created_at` | timestamp | Used for ordering |

#### `user_roles`
| Column | Type | Purpose |
|--------|:----:|---------|
| `user_id` | UUID (FK → auth.users) | The auth user |
| `role` | text | "admin" (only used value) |

---

# Part XIX — Environment, Deployment & Supabase Gotchas

## 23. Environment Variables

### 23.1. Client-Side (Exposed to Browser)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_DEV_MODE` | Enables dev fast-login buttons |
| `NEXT_PUBLIC_DEV_ADMIN_EMAIL` | Dev admin email |
| `NEXT_PUBLIC_DEV_ADMIN_PASS` | Dev admin password |
| `NEXT_PUBLIC_DEV_CAD_EMAIL` | Dev CAD email |
| `NEXT_PUBLIC_DEV_CAD_PASS` | Dev CAD password |

### 23.2. Server-Side Only

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses ALL RLS. Used ONLY in `app/actions/adminAuth.js` |

⚠️ **CRITICAL:** If this key leaks to the client, ALL Row Level Security is bypassed.

### 23.3. Deployment (Vercel)
- Auto-deploy on push to `main`. Preview URLs for PRs.
- Build: `npm run build`. Output: `.next/`
- Env vars: Vercel dashboard → Settings → Environment Variables.

## 24. Supabase Gotchas & Traps

| # | Gotcha | Fix |
|:-:|--------|-----|
| 1 | **406 on empty table** with `.single()` | Use `.limit(1)` + check `data.length > 0` |
| 2 | **Silent field drops** on update | Always list ALL fields in the update payload |
| 3 | **Auth user search paginated** | Set `perPage: 1000` explicitly |
| 4 | **RLS blocks reads** with no SELECT policy | Always verify read policies exist |
| 5 | **Email rate limit** (4/hour free tier) | We use password-only, `email_confirm: true` |
| 6 | **Storage public URLs never expire** | Fine for logos; would need signed URLs for private docs |
| 7 | **`auth.uid()` ≠ `cad_id` by default** | Only true because seed script maps them. See Directive 6 |
| 8 | **JSONB arrays stored as strings** if `JSON.stringify()` | Pass raw JS arrays, don't stringify |

## 25. The Server Action Security Pattern

```text
1. Client sends caller's JWT access token
2. Server Action verifies token against Supabase Auth
3. Checks admin status (dual source)
4. If admin → proceeds with SERVICE_ROLE_KEY
5. If not → returns { success: false, error: "Permiso denegado" }
```

**Rules for new server actions:**
- ALWAYS verify caller from token (never trust client-side `isAdmin`)
- ALWAYS return `{ success, error?, message? }` shape
- NEVER throw — return error objects
