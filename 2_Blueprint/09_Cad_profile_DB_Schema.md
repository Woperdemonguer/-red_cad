# 🏢 Blueprint: Extended CAD Profile Schema

> **Goal:** Based on the PM's request, we are moving the first section ("1. Identificación y contexto CAD" - ~15 questions) out of the hidden Diagnostic Form and directly into the `cad_profiles` database schema.
> 
> **Why?** Because this is structural public data (Founding year, Legal form, Number of partners) that should be visible on their Intranet Directory Business Card.

---

## 1. 📊 Updated Database Schema (`cad_profiles` table)

We will expand the existing `cad_profiles` table in Supabase. We will use specific PostgreSQL data types stringently to match the form constraints.

### Core Identity (Already Created)
| Column Name | Type | UI Input |
| :--- | :--- | :--- |
| `id` | UUID | (System generated) |
| `nombre_comercial` | Text | Text Input (e.g. "Ecoagra") |
| `descripcion_corta` | Text | Textarea (Elevator pitch) |
| `logo_url` | Text | Image Upload Zone |
| `email_contacto` | Text | Email Input |
| `telefono` | Text | Phone Input |
| `territorio` | Enum | Dropdown CCAA (e.g. 'Andalucía') |
| `estado` | Text | Select ('Activo', 'Satélite', 'Inactivo') - Default 'Activo' |
| `grupo_motor` | Text | Select ('Sí', 'No') - Default 'No' |

### Context & Structure (New additions from PDF Pages 1-6)
| Column | Type | Question Mapped | Example |
| :--- | :--- | :--- | :--- |
| `forma_juridica` | Text | 1.3 Forma jurídica | "Cooperativa de primer grado" |
| `ano_constitucion` | Int | 1.4 Año de constitución | `2015` |
| `num_socios_productoras` | Int | 1.5 Número de socias | `45` |
| `num_personas_trabajadoras`| Int | 1.6 Número de trabajadoras | `3` |
| `perfiles_equipo` | Array(Text) | 1.7 Perfiles del equipo | `["Gerencia", "Logística"]` |
| `propiedad_instalaciones` | Text | Select (Propias, Alquiladas, Cesión de uso, Mixto) | "Propias" |
| `roles_externalizados` | Array(Text) | 1.8 Roles externalizados | `["Administración"]` |
| `tipo_gobernanza` | Text | 1.9 Tipo de gobernanza | "Órganos de Gobierno + Equipo Técnico" |
| `radio_comercializacion` | Array(Text) | 1.10 Ámbito territorial | `["Local", "Provincial"]` |
| `red_supraterritorial` | Boolean | 1.11 Forma parte de red? | `true` |
| `red_nombre` | Text | 1.11.a Indique cuál | "COAG" |
| `actividades_cad` | Array(Text) | 1.12 Actividades/Servicios | `["Logística", "Gestión pedidos"]` |
| `modelo_abastecimiento` | Text | 1.14 Modelo abastecimiento | "Sólo producción socios" |
| `abastecimiento_regulado` | Boolean | 1.15 Regulado en estatutos? | `true` |

### Autoevaluación & Madurez (Moved from Section 4 of the Diagnostic Form)
Because the network needs to easily query *"Who is strong in Logistics?"*, we will map the Maturity Matrix directly into the CAD Profile as a structured `JSONB` block, along with the Intercooperation fields.

| Column | Type | Question Mapped | Example |
| :--- | :--- | :--- | :--- |
| `madurez_evaluacion` | JSONB | 4.1 Autoevaluación por ámbitos (10 categorías) | `{"Logística": "🟢 Consolidado", "Calidad": "🟡 En desarrollo"}` |
| `datos_adicionales` | JSONB | **[Architecture Exception Flag]** | `{"nueva_pregunta_random": "Esta respuesta no tiene una columna propia."}` |
| `madurez_fortalezas` | Text | 4.1a Ámbitos con prácticas consolidadas | "Somos muy fuertes coordinando la huerta local..." |
| `madurez_cuellos_botella` | Text | 4.1b Mayores dificultades o cuellos de botella | "Logística de frío compartida" |
| `intercoop_compartir` | Array(Text) | 4.2 Ámbitos para compartir experiencia | `["Digitalización", "Gestión comercial"]` |
| `intercoop_apoyo_necesario` | Array(Text) | 4.3 Ámbitos donde se necesita formación | `["Costes de producción", "Marketing"]` |
| `intercoop_disposicion` | Text | 4.4 Disposición a participar en espacios | "Sí, como participante activo" |
| `intercoop_referentes` | Text | 4.5 Personas embajadoras o referentes | "Miguel en digitalización de Pod" |

---

## 2. 🎛️ How the UI Interconnects

Moving these 15 questions into the Profile Database fundamentally changes the User Experience for the better.

### A. The "Configuración del Perfil" Page (New UI)
When the Admin clicks "Impersonate", they will go to `/profile` (or the CAD goes there directly).
This page will ask these 15 structural questions precisely formatting them into the `cad_profiles` table.

### B. The Diagnostic Form Module `/form` (Updated)
Because we ripped these 15 questions out of the massive diagnostic form... the logic changes:
- Section 1 of the Diagnostic Form becomes much shorter.
- The Diagnostic Form now focuses strictly on *operational health metrics* (Governance Health, Financial Health, Logistics Health), not structural identity.

### C. The Directory Profile View `/directory/[cad_id]`
When another CAD clicks on "Biolur" in the Intranet Directory...
- The page queries the `cad_profiles` table.
- It displays a beautiful Business Card UI showing: their Logo, Founding Year (`ano_constitucion`), the size of their network (`num_socios_productoras`), and their `radio_comercializacion`.

---

## 3. 🛠️ Action Plan for Engineering Team
If the PM approves this data model:
1. Run an `ALTER TABLE cad_profiles` SQL command in Supabase to add these new columns.
2. Build the `/profile` settings page with React Hook Form to allow CADs (or the Admin impersonator) to fill out this data.
3. Delete these same questions from the massive `diagnostic_forms` JSON definition to prevent asking them twice.
