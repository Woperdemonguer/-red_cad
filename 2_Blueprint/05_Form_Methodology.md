---
Title: 05_Form_Methodology
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Content Strategy & UX Design
  Dependencies: [06_Form_Content.md, 09_Cad_profile_DB_Schema.md, 07_DB_Interconnections_and_Profiles.md]
  Related_Code: [3_Product/frontend/app/(protected)/form/page.jsx, 3_Product/frontend/config/diagnosticForm.js]
  Core_Entities: [diagnostic_forms, cad_profiles]
---

# Informe de cambios — Formulario de diagnóstico

## 🧑‍💼 The Human Translation
> **What is this document?**
> This explains *why* the 63-question diagnostic form is built the way it is. If someone asks "Why don't we ask for the cooperative's founding year in the form?", this document holds the answer: We ripped all those static questions out of the form and put them permanently in their Profile so they don't have to answer the same boring questions every single year.
> 
> **The Key Analogy:**
> Think of the Form not as an exam, but as a "Doctor's Checkup" for a business. Every year, the doctor asks: "How's your diet? Any pain? Any stress?" (those are the 63 questions). But the doctor does NOT ask for your blood type, your date of birth, or your home address every visit. That info lives permanently on your medical record (the `cad_profiles` table). This separation makes the annual checkup much faster and less exhausting.
>
> **Another Analogy — The "No Jargon" Rule:**
> The original form sounded like a corporate consultancy survey. We rewrote every question to sound like a friendly conversation between cooperatives. Instead of "Evaluate your commercial maturity on a Likert scale," we say "¿Cómo ves la situación de vuestro CAD en cada uno de estos ámbitos?" with a simple traffic light (🔴🟡🟢).

---

> **Technical Purpose:** Contextual document explaining the evolution, tone shifts, structural decisions, and JSONB architecture behind the 63-question Diagnostic Form. Essential for understanding *why* the form looks the way it does and how future changes should be made.

---

## 1. 🏗️ Decisiones estructurales (Arquitectónicas)

### 1.1. Separación de la información de producto
La decisión más importante ha sido **separar la información granular de producto del formulario**. Los datos de catálogo, precios, calendarios, formatos y variedades se recogerán por otra vía: importación directa de los sistemas de gestión de cada CAD (Módulo 2). Esto permite:
- Reducir drásticamente la carga del formulario (elimina ~15 preguntas de detalle de producto).
- Obtener datos de mayor calidad y granularidad (precios exactos, no aproximaciones).
- Construir una BBDD relacional para cruces rápidos entre CADs (`08_Product_module_DB_Schema.md`).

### 1.2. Precumplimentación e Identidad transferida a `cad_profiles`
La ficha de identificación de cada CAD (nombre, año de fundación, forma jurídica, CIF, territorio, contacto público) migra fuera del `diagnostic_forms` y vive en el `cad_profiles` público y estructurado (`09_Cad_profile_DB_Schema.md`). 

**Impact:** Eliminadas ~15 preguntas del formulario original. Los usuarios agradecen no tener que repetir datos estáticos.

### 1.3. Reestructuración en 9 bloques
El formulario interactivo sigue una secuencia que va de lo identitario a lo económico:

| Bloque | Nombre | Preguntas | Tiempo estimado |
|--------|--------|:---------:|:--------------:|
| 0 | Validación ficha CAD | 4 | 2 min |
| 1 | Gobernanza interna | 6 | 5 min |
| 2 | Modelo de negocio | 9 | 8 min |
| 3 | Capacidad operativa | 8 | 7 min |
| 4 | Madurez e intercooperación técnica | 8 | 6 min |
| 5 | Oferta y necesidades | 10 | 8 min |
| 6 | Calidad | 6 | 5 min |
| 7 | Identidad y comunicación | 7 | 5 min |
| 8 | Expectativas | 5 | 4 min |
| **Total** | | **63** | **~50 min** |

### 1.4. Scalable Content Architecture
All question text, option arrays, and block introductions live in `config/diagnosticForm.js` — NOT inside the React component. This means:
- A PM or content strategist can edit question wording without touching React code.
- The React component simply iterates over the config arrays, rendering the appropriate input type.
- New questions can be added by appending to the config array. No React logic changes needed.

---

## 2. 🗣️ Cambios de tono y narrativa

Se ha realizado un trabajo profundo de ajuste del tono:

| Before (Corporate Tone) | After (Network Tone) |
|---|---|
| "La Secretaría Técnica os pide" | "Como red se propone" |
| "Evalúe su madurez comercial" | "¿Cómo veis la situación en este ámbito?" |
| "Indique el número de personas FTE" | "¿Cuántas personas forman parte del equipo técnico?" |
| "N/A" | "No aplica / No tenemos este tipo de información" |

**Key Principles:**
- **Inclusivity:** Every closed question includes an "Otro + comentario opcional" escape hatch. No cooperative should feel that none of the pre-filled options apply to them.
- **No jargon:** No "Likert scales," no "KPI metrics," no "stakeholder alignment." Plain Spanish, as spoken between cooperatives in a meeting.
- **Empathy for sensitive data:** For financial questions (facturación, resultado), we always include "Se prefiere no compartir de momento" as a valid, non-judgmental option.

---

## 3. 🚦 Contenido nuevo significativo (El JSONB)

### 3.1. Autoevaluación de madurez (Bloque 4)
Incluye una matriz tipo semáforo por ámbitos logísticos, comerciales, técnicos, y de gobernanza.

| Semáforo | Meaning | JSONB Value |
|----------|---------|-------------|
| 🔴 | Necesita apoyo urgente | `"🔴"` |
| 🟡 | En desarrollo / avanzando | `"🟡"` |
| 🟢 | Consolidado / maduro | `"🟢"` |

*Implementación técnica:* Esto se almacena como el objeto JSONB `madurez_evaluacion` en `cad_profiles`, NOT in `diagnostic_forms`. This is intentional — the maturity semaphore is a quasi-permanent property of the CAD, not a one-time checkup answer.

### 3.2. Intercooperación Técnica (Bloque 4)
Two sub-questions:
1. "¿En qué ámbitos podríais aportar formación o experiencia a la red?" → Stored as `intercoop_tecnica.aportar[]`
2. "¿En qué ámbitos os gustaría aprender de otros CADs?" → Stored as `intercoop_tecnica.aprender[]`

**Why this matters:** This data powers the future "Matchmaking" feature — the app can automatically suggest connections between CADs that teach what others want to learn.

---

## 4. 🔧 How to Add a New Question (For AI & Developers)

1. **Edit `config/diagnosticForm.js`:** Add the question object to the appropriate block array.
2. **Choose the right type:** `radio`, `checkbox`, `textarea`, `select`, or `semaphore`.
3. **If the answer maps to a JSONB column:** Ensure the key matches the expected structure in `cad_profiles.madurez_evaluacion` or `cad_profiles.intercoop_tecnica`.
4. **If the answer is a standard diagnostic response:** It will be stored as a flat key-value in the `diagnostic_forms` table.
5. **Update `06_Form_Content.md`** with the new question text for documentation purposes.
6. **NO database migration needed** if the new question's answer is stored in JSONB or in the existing flat `form_data` column.
