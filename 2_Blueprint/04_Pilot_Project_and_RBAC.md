---
Title: 04_Pilot_Project_and_RBAC
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Authentication, Security & Context Initialization
  Dependencies: [09_Cad_profile_DB_Schema.md, 02_Architecture_and_Methodology.md]
  Related_Code: [3_Product/frontend/app/(protected)/admin/page.jsx, 3_Product/frontend/lib/supabaseService.js, 3_Product/frontend/scripts/bootstrap_admin_pass.js, 3_Product/frontend/scripts/add_shared_admin.js, 3_Product/frontend/app/actions/adminAuth.js]
  Core_Entities: [auth.users, cad_profiles, admin_users_mapping]
---

# 🚀 Blueprint: Pilot Project & Roles (The Foundation for 3 CADs)

## 🧑‍💼 The Human Translation
> **What is this document?**
> This explains how we keep everyone's data safe, and how we magically create accounts for the pilot users.
> 
> **The Key Analogies:**
> - **RBAC (Role Based Access Control):** Imagine the platform is a hotel. Each CAD gets a standard room key — they can only open their own door and see their own luggage. The Technical Secretariat gets the "Master Key" (Admin Role) allowing them to see all rooms, help guests if they lock themselves out, and even enter a guest's room temporarily to fix things on their behalf.
> - **The Seed Script:** We don't want guests arriving to an empty, sad hotel room. Before they login for the very first time, we run a "Seed Script" that secretly builds their room and puts their logo on the wall. When they log in, they say "Wow, they already know who I am!" This first impression is crucial for adoption.
> - **Impersonation:** Sometimes a guest calls the front desk and says "I can't fill out this form, can you do it for me?" Instead of building a separate admin form, we give the concierge a temporary copy of the guest's room key. The concierge walks into the room, fills the form, and everything is saved under the guest's name. The guest never knows the difference.

---

> **Technical Purpose:** Implementation specification for Role-Based Access Control (Admin vs. User), augmented CAD Profiles, and the Seed Data process leading up to the 3-CAD Pilot Test.

---

## 🛡️ 1. Role-Based Access Control (RBAC)

### 1.1. The Two Roles

| Role | Who | Access Level | How RLS Works |
|------|-----|-------------|---------------|
| **Admin** | Secretaría Técnica (CERAI + POD + GIASAT) | Full access to ALL data across ALL CADs | Bypasses RLS via `SUPABASE_SERVICE_ROLE_KEY` in Server Actions |
| **User** | CAD Coordinators (16 cooperatives) | Access ONLY to their own `cad_id` data | RLS policy: `auth.uid() = cad_id` on all tables |

### 1.2. Technical Implementation
We rely on a specific mapping table linked to Supabase Auth.

- **Admin Detection:** When a user logs in, the app checks if their `auth.uid()` exists in the `admin_users_mapping` table. If yes, the app renders the `/admin` route and unlocks elevated privileges.
- **User Isolation:** Standard users are completely sandboxed by RLS. Even if they manually type `/admin` in the URL, the server queries will return empty results because RLS filters out all rows that don't match their `cad_id`.
- **Multi-Admin Support:** An existing Admin can create new Admins from the Admin Dashboard. The Server Action uses the `SUPABASE_SERVICE_ROLE_KEY` to securely create the new `auth.users` account and add their UUID to `admin_users_mapping`.

### 1.3. Security Considerations
- The `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in Server Actions (server-side code). It is NEVER imported in client components.
- Admin detection happens on the server via a Supabase query, not via a client-side flag that could be spoofed.
- There is no "self-registration." All accounts are created by an Admin via the Seed Script or the Admin Dashboard. This is intentional for a closed, invitation-only network.

---

## 📜 2. Strict Data Contracts

### 2.1. The Admin Mapping Table
```typescript
interface AdminUserMapping {
  id: string;          // The UUID from auth.users
  email: string;       // The admin's email address
  created_at: Date;    // When they were granted admin access
  granted_by: string;  // UUID of the admin who promoted them
}
```

### 2.2. The Impersonation Context
When an Admin clicks "Impersonate CAD Murcia," the frontend layout receives this context object to adjust its rendering:
```typescript
interface ImpersonationContext {
  is_admin: boolean;              // True if the real user is an admin
  actual_user_id: string;         // The Admin's true UUID (for audit trails)
  impersonating_cad_id: string | null; // The UUID of the CAD they are pretending to be. Null if not impersonating.
}
```

### 2.3. The Seed Data Input Format
The CSV file that the PM provides to create the initial pilot accounts:
```typescript
interface SeedDataRow {
  nombre_comercial: string;       // E.g. "Biolur"
  descripcion_corta: string;      // E.g. "Cooperativa agroecológica de Bizkaia"
  email_contacto: string;         // The login email AND the contact email
  telefono: string;               // Public phone
  territorio: string;             // E.g. "País Vasco"
  logo_url: string;               // URL to the cooperative's logo image
  password: string;               // The initial password assigned by the admin
}
```

---

## 🌱 3. The Seed Script (Pre-filling the 3 Pilot CADs)

We want a "Wow" factor when the pilot CADs first log in.

### 3.1. The Process
| Step | Script | What it does |
|------|--------|-------------|
| 1 | PM prepares `seed_data.csv` | Fills in the cooperative's name, email, phone, territory, logo URL, and initial password |
| 2 | Engineer runs `node scripts/bootstrap_admin_pass.js` | Reads the CSV, creates `auth.users` accounts via the Admin API, populates `cad_profiles` with the identity data |
| 3 | Engineer runs `node scripts/add_shared_admin.js` | Creates the shared admin account (for the Secretaría Técnica) and adds it to `admin_users_mapping` |
| 4 | CAD coordinator receives an email with their login credentials | They navigate to the login page, enter their email and password |
| 5 | The app detects their populated profile | Dashboard says: *"¡Hola Biolur! Tu perfil ya está preparado. Revísalo y completa el diagnóstico."* |

### 3.2. Critical Technical Details
- The Seed Script uses `SUPABASE_SERVICE_ROLE_KEY` to bypass all auth restrictions.
- It creates `auth.users` entries with `email_confirm: true` (skipping email verification for invite-only accounts).
- The `auth.users.id` UUID is DIRECTLY mapped as the `cad_profiles.id`. They are the SAME UUID. This is intentional and is the foundation of all RLS policies.
- If the script is run twice with the same emails, it will fail (duplicate key constraint). The script should handle this gracefully with a try/catch.

---

## 🎛️ 4. The Admin UX (`app/(protected)/admin/page.jsx`)

A dedicated control panel that completely bypasses RLS to give the Secretaría Técnica full visibility.

### 4.1. Features
| Feature | Description | Data Source |
|---------|-------------|-------------|
| **CAD Overview Table** | A sortable table showing all `cad_profiles` with name, territory, status, and grupo motor flag | `SELECT * FROM cad_profiles` |
| **Form Completion Status** | A progress bar or percentage showing how many of the 63 questions each CAD has answered | `SELECT COUNT(non-null fields) FROM diagnostic_forms WHERE cad_id = ?` |
| **Product Volume** | The count of products each CAD has uploaded to the catalog | `SELECT COUNT(*) FROM prices_availability WHERE cad_id = ? GROUP BY cad_id` |
| **Password Management** | A button to reset/assign a new password for any CAD | Server Action → `supabase.auth.admin.updateUserById(id, { password })` |
| **Impersonate Button** | A button that mints an ephemeral JWT for the target `cad_id` | Server Action → `generateImpersonationToken(cad_id)` |
| **CSV Export** | Download a CSV of all diagnostic form responses for external analysis | Server-side query → CSV generation → file download |
