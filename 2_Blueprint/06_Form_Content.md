---
Title: 06_Form_Content
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Form Content & Business Logic
  Dependencies: [05_Form_Methodology.md]
  Related_Code: [3_Product/frontend/config/diagnosticForm.js, 3_Product/frontend/app/(protected)/form/page.jsx]
  Core_Entities: [diagnostic_forms]
---

# 📋 The RedCAD Hub Diagnostic Form: Full Content Spec

## 🧑‍💼 The Human Translation
> **What is this document?**
> This is simply the exact script and questions for the Diagnostic Form, written out in plain text. It contains the 63 questions the cooperatives will answer, organized by block. 
> 
> **Two Important Notes:**
> 1. *For Content Editors:* If you want to change a word in Question 1.2, you can see the text here, but a developer must ALSO update the specific configuration file (`config/diagnosticForm.js`) so the actual website updates. This document is the "reference copy," the config file is the "live copy."
> 2. *For Developers/AI:* This document provides the content intent. The actual rendering logic (conditional visibility, state management, auto-save) lives in the React component (`form/page.jsx`). This document defines WHAT is asked; the code defines HOW it's shown.

---

> **Technical Purpose:** The absolute source of truth for the 63 questions in the RedCAD Hub Diagnostic Form. Contains question IDs, types, conditional logic, and internal developer notes. This file and `config/diagnosticForm.js` must always be kept in sync.

---

> [!IMPORTANT]
> **AI Instruction:** Do NOT hardcode this massive content directly into a React `.jsx` file. This content must live in `3_Product/frontend/config/diagnosticForm.js` so it can be cleanly imported into the React UI components, allowing non-developers to edit the text without breaking the codebase.

---

## 🗂️ 1. Estructura General

El formulario consta de 8 bloques + 1 bloque de validación inicial.

| Block ID | Block Name | Questions | Data Destination |
|----------|-----------|-----------|-----------------|
| 0 | Validación ficha | 4 | `cad_profiles` (profile corrections) |
| 1 | Gobernanza interna | 6 | `diagnostic_forms` |
| 2 | Modelo de negocio | 9 | `diagnostic_forms` |
| 3 | Capacidad operativa | 8 | `diagnostic_forms` |
| 4 | Madurez e intercooperación técnica | 8 | `cad_profiles.madurez_evaluacion` (JSONB) |
| 5 | Oferta y necesidades | 10 | `diagnostic_forms` |
| 6 | Calidad | 6 | `diagnostic_forms` |
| 7 | Identidad y comunicación | 7 | `diagnostic_forms` |
| 8 | Expectativas | 5 | `diagnostic_forms` |

*Note: The 15 historical "Identificación" questions have been intentionally moved to the CAD Profile (`cad_profiles` database table) to avoid asking users the same static questions repeatedly every year.*

---

## 📜 2. Data Contract (The Form Output Payload)

When a CAD submits this 63-question form, the React component MUST output a flat JSON object where the Keys are the specific Question IDs defined below.

```typescript
interface DiagnosticFormPayload {
  cad_id: string;       // Injected server-side from the auth session
  
  // Block 0 — Validation
  "0.1": string;        // "Sí, todo correcto" | "No, hay datos que actualizar"
  "0.2": string | null; // Conditional: only if 0.1 === "No"
  "0.3": string;        // Full contact details string
  "0.4": string | null; // Optional second contact
  
  // Block 1 — Gobernanza
  "1.1": string;        // Selected radio option
  "1.2": string;        // Selected radio option
  // ... continues for all 63 questions
  
  // Block 4 — Maturity (Special: maps to JSONB in cad_profiles)
  "4.1": {
     "logistica": "🔴" | "🟡" | "🟢",
     "comercial": "🔴" | "🟡" | "🟢",
     "gobernanza": "🔴" | "🟡" | "🟢",
     // ... dynamic keys
  };
  
  submitted_at: Date;
  last_saved_at: Date;  // For auto-save tracking
}
```

---

## 3. Bloque 0: Validación ficha 📋

**Block Intro:** Se ha preparado desde la red una ficha con los datos básicos de cada agrupación (*estos provienen de la tabla `cad_profiles`*). Se invita a revisarla e indicar si hay algo que actualizar.

| ID | Question | Type | Options | Conditional |
|----|----------|------|---------|-------------|
| 0.1 | ¿Los datos de la ficha pre-cumplimentada enviada son correctos? | Radio | Sí, todo correcto \| No, hay datos que actualizar | — |
| 0.2 | Si hay datos que actualizar, indicar cuáles | Textarea | — | Only if 0.1 = "No" |
| 0.3 | Persona de contacto principal para intercooperación económica | Textarea | — | (nombre, cargo, email, teléfono) |
| 0.4 | ¿Hay una segunda persona de contacto para estos temas? | Textarea | — | Optional |

---

## 4. Bloque 1: Gobernanza interna 🤝

**Block Intro:** Resulta importante entender cómo se organiza y toma decisiones cada agrupación. Cada CAD tiene su forma de funcionar, y eso condiciona cómo se puede cooperar entre todos.

| ID | Question | Type | Options |
|----|----------|------|---------|
| 1.1 | ¿Cómo se toman las decisiones comerciales en el CAD? | Radio + Otro | El equipo técnico tiene autonomía \| Comisión \| Junta/asamblea \| Sin proceso definido |
| 1.2 | ¿Quién coordina la oferta y la relación con clientes? | Radio + Otro | Equipo técnico \| Comisión comercial \| Junta directiva \| Liderazgos informales \| Nadie claro |
| 1.3 | ¿Se ha tratado el tema de comprar/vender producto a otros CAD? | Radio | Sí, hay respaldo claro \| Sí, pero hay dudas \| No, no se ha planteado \| No aplica |
| 1.4 | Si hay dudas o resistencias, ¿cuáles son? | Textarea | — |
| 1.5 | ¿Cómo describirías la relación equipo técnico—base social? | Radio + Otro | Fuerte \| Funcional \| Frágil \| No aplica |
| 1.6 | ¿Existe algún servicio externalizado clave? | Textarea | Optional. E.g. logística, contabilidad |

---

## 5. Bloque 2: Modelo de negocio 📊

**Block Intro:** Como red es importante tener una imagen clara de dónde está cada agrupación. Como se planteó en Granada: "tener un espacio donde expresar necesidades, poder compartir un momento económico complicado".

| ID | Question | Type | Options |
|----|----------|------|---------|
| 2.1 | Volumen aproximado de facturación anual | Radio + Comentario | <50K \| 50-150K \| 150-300K \| 300-600K \| 600K-1M \| 1-1.5M \| >1.5M \| Prefiere no compartir |
| 2.2 | Evolución de la facturación en los últimos 3 años | Radio + Otro | Crecimiento sostenido \| Moderado \| Estable \| Irregular \| Descenso \| Sin histórico \| No compartir |
| 2.3 | ¿El CAD genera resultado positivo? | Radio + Otro + Comentario | Positivo consolidado \| Equilibrio \| Negativo previsto \| Negativo complicado \| Sin cierre \| No compartir |

*(The full 63-question script continues in the actual frontend config file `config/diagnosticForm.js`. This document provides the representative sample and structure. All blocks follow the same tabular format above.)*

---

## 6. Developer Notes

### 6.1. Conditional Logic Rules
- Question 0.2 is ONLY visible when Question 0.1 === "No, hay datos que actualizar"
- Question 1.4 is ONLY visible when Question 1.3 includes "dudas" or "resistencias"
- All "Otro" free-text fields are ONLY visible when the user selects the "Otro" radio option

### 6.2. Auto-Save Behavior
- The form auto-saves to Supabase when the user navigates between blocks (clicking "Siguiente" or "Anterior")
- A manual "Guardar borrador" button is always visible
- The `last_saved_at` timestamp is shown to the user for peace of mind

### 6.3. Submission Logic
- The form is only considered "submitted" when the user reaches Block 8 and clicks "Enviar formulario completo"
- Partial saves are stored with `submitted_at = null`
- The Admin panel shows completion status based on whether `submitted_at IS NOT NULL`
