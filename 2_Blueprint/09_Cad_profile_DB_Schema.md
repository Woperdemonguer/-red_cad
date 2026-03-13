---
Title: 09_Cad_profile_DB_Schema
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Database Schema & Organization Identity
  Dependencies: [04_Pilot_Project_and_RBAC.md, 07_DB_Interconnections_and_Profiles.md]
  Related_Code: [3_Product/frontend/app/(protected)/profile/page.jsx, 3_Product/frontend/config/profileOptions.js, 3_Product/frontend/lib/supabaseService.js]
  Core_Entities: [cad_profiles]
---

# 🏢 Schema Blueprint: The CAD Profile Expansion

## 🧑‍💼 The Human Translation
> **What is this document?**
> This explains where all the static, permanent information about a cooperative is stored — their logo, their phone number, what region they operate in, whether they're part of the steering committee. 
> 
> **The Key Analogy — The Flexible Digital Backpack (JSONB):**
> Usually, if a PM wants to add a new tracking metric like "Are they using TikTok for marketing?", the engineers have to halt the server, write a database migration script to add a new column, test it, deploy it, and restart. This can take hours and risks breaking things.
>
> With our "Flexible Digital Backpack" (the `JSONB` column), the PM can add *anything* they want. The database has a special column that acts like a bottomless backpack — you can throw any combination of key-value pairs into it, and it stores them happily. Adding "TikTok Marketing: 🟢" takes 5 minutes of editing a config file, no database migration needed, no server downtime.

---

> **Technical Purpose:** Exact architectural specification for the `cad_profiles` table, defining how structural CAD identity, maturity matrices, and admin flags are stored outside the diagnostic form. This is the central nexus table of the entire platform — almost every other table has a foreign key pointing back to it.

---

## 🏗️ 1. The Schema Architecture

### 1.1. The Standard Columns (Fixed Schema)

| Column Name | PostgreSQL Type | Constraints | Origin | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY | Mapped from `auth.users.id` (1:1) | `a1b2c3d4-...` |
| `nombre_comercial` | `text` | NOT NULL | Seed Script / Profile Editor | "Biolur" |
| `descripcion_corta` | `text` | | Profile Editor | "Cooperativa agroecológica de Bizkaia" |
| `forma_juridica` | `text` | | Profile Editor | "Cooperativa" |
| `ano_fundacion` | `integer` | | Profile Editor | 2015 |
| `email_contacto` | `text` | | Seed Script / Profile Editor | "info@biolur.org" |
| `telefono` | `text` | | Profile Editor | "+34 600 123 456" |
| `territorio` | `text` | | Seed Script | "País Vasco" |
| `alcance_geografico` | `text` | | Diagnostic Form (Q3.5) | "Provincial" |
| `personas_equipo` | `integer` | | Profile Editor | 8 |
| `base_social` | `integer` | | Profile Editor | 45 |
| `logo_url` | `text` | | Supabase Storage bucket link | "https://...supabase.co/storage/.../biolur-logo.png" |
| `estado` | `text` | DEFAULT 'Activo' | Admin Dashboard | "Activo" \| "Satélite" \| "Inactivo" |
| `grupo_motor` | `boolean` | DEFAULT false | Admin Dashboard | true |
| `perfiles_equipo` | `text[]` | Array | Profile Editor | `["Gerencia", "Técnico campo", "Logística"]` |
| `propiedad_instalaciones` | `text` | | Profile Editor | "Propia" \| "Alquilada" \| "Cedida" |

### 1.2. The JSONB Columns (Flexible Schema — "The Backpacks")

| Column Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `madurez_evaluacion` | `jsonb` | The traffic-light maturity scores per domain | `{"logistica": "🟡", "comercial": "🟢", "gobernanza": "🔴"}` |
| `intercoop_tecnica` | `jsonb` | What the CAD can teach and wants to learn | `{"aportar": ["Logística", "Marketing"], "aprender": ["Gobernanza"]}` |

**Why JSONB instead of 15 separate columns?**
Because the PM changes the maturity dimensions frequently. Adding a new dimension (e.g., "Marketing Digital") with JSONB requires:
1. Edit `config/profileOptions.js` to add the new option
2. The React component automatically renders a new row in the semaphore matrix
3. The database stores the new key-value pair inside the existing JSONB column
4. **Total time: 5 minutes. No SQL migration. No server restart. No deployment.**

Adding the same dimension with traditional columns would require:
1. Write an `ALTER TABLE ADD COLUMN` SQL migration
2. Update `lib/supabaseService.js` to include the new column in the payload
3. Update the React component to render the new field
4. Test the migration on staging
5. Deploy to production
6. **Total time: 1-2 hours. Risk of breaking changes.**

---

## 📜 2. Strict Data Contract (For AI & React)

When interacting with the `cad_profiles` table via Supabase, AIs must strictly follow this TypeScript structure for the payload to prevent the silent field-drop bug (See `.agent/core/lessons_learned.md`, Directive 4).

```typescript
interface CadProfilePayload {
  // --- Static primitives (fixed columns) ---
  nombre_comercial: string;
  descripcion_corta: string | null;
  forma_juridica: string | null;
  ano_fundacion: number | null;
  email_contacto: string | null;
  telefono: string | null;
  territorio: string | null;
  alcance_geografico: string | null;
  personas_equipo: number | null;
  base_social: number | null;
  logo_url: string | null;
  estado: "Activo" | "Satélite" | "Inactivo";
  grupo_motor: boolean;
  perfiles_equipo: string[];          // Postgres text[] array
  propiedad_instalaciones: string | null;
  
  // --- Dynamic JSONB Columns ("The Backpacks") ---
  madurez_evaluacion: {
    [metric_key: string]: "🔴" | "🟡" | "🟢";
  };
  intercoop_tecnica: {
    aportar: string[];   // What this CAD can teach
    aprender: string[];  // What this CAD wants to learn
  };
}

// The Supabase service function MUST include ALL of these fields in the .update() payload.
// If ANY field is omitted from the payload, Supabase will NOT update it (it won't error, it just silently ignores it).
// This has caused data loss bugs before. See lessons_learned.md, Directive 4.
```

---

## 🛡️ 3. User Experience Impact

| Feature | How `cad_profiles` Powers It |
|---------|------------------------------|
| **The Lighter Form** | 15+ static questions removed from the diagnostic flow → higher completion rates |
| **The "Mi Perfil" Settings Tab** | Users navigate to `/profile` anytime to update their public logo or email — no need to re-do the entire 63-question form |
| **The Searchable Directory** | `SELECT * FROM cad_profiles WHERE territorio = 'Andalucía' AND estado = 'Activo'` → instant filtering |
| **The Maturity Map** | `SELECT nombre_comercial, madurez_evaluacion FROM cad_profiles` → renders semaphore badges on the dashboard |
| **The Matchmaking Engine** | Cross-reference `intercoop_tecnica.aportar[]` from one CAD with `intercoop_tecnica.aprender[]` from another |
