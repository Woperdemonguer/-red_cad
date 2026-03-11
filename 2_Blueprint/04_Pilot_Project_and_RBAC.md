# 🚀 Blueprint: Pilot Project & Roles (The Foundation for 3 CADs)

> **Status:** Planning / Pending PM Approval
> **Goal:** Transition the platform to a "Production-Ready" state by creating Role-Based Access Control (Admin vs. User), adding rich Profile data beyond the diagnostic form, and seeding the database for a 3-CAD pilot test.

---

## 💡 Resumen Ejecutivo (Para Perfiles No Técnicos)
Este documento explica cómo prepararemos la plataforma para que los primeros 3 CADs la prueben de forma totalmente segura:
- **Roles y Accesos (RBAC):** Imagina que la plataforma es un edificio seguro. Cada CAD tiene una "llave virtual" que solo abre la puerta de su propia oficina (imposibilitando que modifiquen datos ajenos). Sin embargo, tú (la Secretaría Técnica) tienes la "Llave Maestra" (Rol de Administrador) para ver todo el edificio desde tu propio Panel de Control independiente.
- **Perfiles Públicos:** Las respuestas del largo formulario de diagnóstico (que operan por detrás) auto-alimentarán una "Tarjeta de Visita" pública para cada CAD (logo, descripción, contacto público) para que la red se conozca.
- **El Truco de Inicio:** Para que los CADs no abran una App vacía el primer día, los programadores cargaremos previamente sus datos básicos ("Seed Script"). Cuando una coordinadora entre la primera vez, ya verá su cuenta creada y su logo cargado para causar el efecto "Wow".

---

## 1. 🛡️ Role-Based Access Control (RBAC)
To allow you (the PM/Secretaría Técnica) to browse all data, while restricting normal CADs to only see their own data, we must implement roles.

### Technical Implementation:
We will create a specific `user_roles` table in Supabase.
- **Admin Role:** (Your account). Admins bypass the standard Row Level Security (RLS) policies. They can view the `/admin` dashboard and access the `diagnostic_forms` and `products` of *all* CADs.
- **User Role:** (The 16 CAD Coordinators). Users are restricted by RLS. They can only edit data that matches their specific `cad_id`.

## 2. 🏢 The `cad_profiles` Schema (Augmented Data)
The Diagnostic Form captures operational *maturity*. But for the Intranet Directory to look like a real platform, each CAD needs a "Business Card" profile.

### The New Database Table (`cad_profiles`):
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `cad_id` | UUID | Primary Key (identificador único del CAD) |
| `nombre_comercial` | Text | E.g. "Biolur", "Tierra y Libertad" |
| `descripcion_corta` | Text | Biografía breve de la agrupación (pitch) |
| `logo_url` | Text | Enlace al logotipo de la entidad |
| `email_contacto` | Text | Correo público para intercooperación |
| `telefono` | Text | Teléfono público |
| `territorio` | Text | CCAA / Provincia de influencia |
| `ano_fundacion` | Int | Año en que nació el CAD |

*Note: The results from the `diagnostic_forms` (their maturity score) will be visually combined with this `cad_profiles` data on their Network Profile Page.*

---

## 3. 🌱 The Seed Script (Pre-filling the 3 Pilot CADs)
We don't want the pilot CADs starting with a blank screen. We want a "Wow" factor when they first log in.

### The Process:
1. **The Source:** The PM provides a simple Excel/CSV file with the 3 pilot CADs containing: Name, Short Description, Logo URL, Contact Email, Territorio.
2. **The Script:** Engineering writes a one-time Node.js script (`db_seed.js`). 
3. **Execution:** This script talks directly to Supabase, bypassing the UI. It creates their accounts and populates the `cad_profiles` table.
4. **The User Experience:** When the CAD coordinator logs into `http://localhost:3000/login` with their assigned password, the system detects their populated profile. The Dashboard says: *"¡Hola [Nombre del CAD]! Revisa tu perfil y completa el diagnóstico."*

---

## 4. 🎛️ The Admin UX (`app/(protected)/admin/page.jsx`)
For the Secretaría Técnica (You). A dedicated control panel.

### Features:
- **CAD Overview List:** A table showing the 3 Pilot CADs.
- **Form Status Column:** Shows if they have completed the 63 questions (Pending / In Progress / Completed).
- **Product Volume:** Shows how many products they have successfully injected into the Global Catalog.
- **"Impersonate" Button (Future Phase):** A button allowing the Admin to view the interface exactly as that specific CAD sees it to provide tech support.

---

## 📍 Action Items to Execute this Blueprint:
1. Run SQL scripts in Supabase to create `user_roles` and `cad_profiles` tables.
2. Build the UI for `/admin`.
3. Modify the Dashboard Hub sidebar to only show "Panel Admin" if `role === 'admin'`.
4. Ask the PM for the 3 Pilot CADs' base info.
