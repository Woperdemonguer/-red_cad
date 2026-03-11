# 🧩 Blueprint: Database Inter-connection (Profiles vs. Diagnostics)

> **Target Audience:** Product Manager
> **Purpose:** To clarify how the "Profile Info", "Diagnostic Form", and "Global Catalog" are separated but interconnected in the RedCAD Hub architecture.

---

## 1. 🏗️ The Separation of Concerns (Por qué separamos la BBDD)

You asked a brilliant architectural question: *"Are the profile questions and the diagnostic form separated or together?"*

**Answer:** They are completely separated into two distinct Tables, but linked by an invisible cord.

We do this because they serve two entirely different purposes:
1. **The CAD Profile:** Is the "Public Face" (The Business Card). It drives the Intranet Directory.
2. **The Diagnostic:** Is the "Internal Health Metric" (The X-Ray). It drives the Maturity Matrix.

---

## 2. 🗂️ The Three Core Schemas (How they connect)

Imagine the Database as three distinct folders, all tied together by a single `cad_id` (e.g., id: `123e4567`).

### A. The Profile Schema (`cad_profiles` table)
This is the "Profile Information" you mentioned from the initial document. It holds the structural identity.
- `id` (The master connection key)
- `nombre_comercial` (e.g., "Ecoagra")
- `logo_url`
- `territorio`
- `descripcion_corta` (The "About Us" pitch)
- `telefono` & `email_contacto`
- *[NEW - To be added]*: Location coordinates, team size, etc.

### B. The Diagnostic Schema (`diagnostic_forms` table)
This holds the 63 answers from the long form. 
- `cad_id` (Points directly to `cad_profiles`)
- `gov_q1_score` (Governance answer 1)
- `fin_q4_score` (Financial answer 4)
- *The app calculates the total maturity score dynamically from this table.*

### C. The Product Schema (`products` & `prices_availability`)
- `cad_id` (Points directly to `cad_profiles`)
- Tells us exactly what this specific CAD is selling.

---

## 3. 🎭 How You (The Admin) Can Fill Out Data for Them

You asked: *"Can I just create a list of accounts and start filling up their profile information for them?"*

**Yes, absolutely.** That is exactly why I built the **"Panel Admin"** today! 

### The "Impersonation" Feature (Modo Fantasma)
Right now, you see the 16 CADs listed in your `/admin` dashboard. In the far right column, there is an action called *"Impersonate"* (Suplantar Identidad).

Here is how the flow will work once we activate that button in the code:
1. You (Admin) click "Impersonate" next to *Ecoagra*.
2. The system temporarily transforms your Role into `cad_id: Ecoagra`.
3. You navigate to the `/form` page. You are now seeing *Ecoagra's* diagnostic form. You can fill out all 63 questions for them.
4. You navigate to `/profile` (A new page we will build). You are now seeing *Ecoagra's* business card details. You can upload their logo and type their short description.
5. You click "Stop Impersonating" at the top of the screen, and you return to your Admin God-Mode.

### Why this is the best method:
You don't need 16 different passwords. You log in once as the PM, and you dynamically "wear the mask" of any CAD to set up their environment for them.
