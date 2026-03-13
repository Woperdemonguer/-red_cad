# 🌱 RedCAD Hub — El Sistema Nervioso Digital de la Red Estatal de CAD

> **For newcomers:** This README is your airport terminal map. It tells you where everything is, why it's there, and how to get started. You do NOT need to understand programming to read this document.

Este repositorio (`Red de cad`) contiene **todos los archivos** necesarios para el desarrollo, planificación y ejecución de la Intranet de la Red Estatal de Centros Agroecológicos de Distribución (impulsada por GIASAT, POD y Fundación Daniel y Nina Carasso).

---

## 🗺️ El Mapa del Proyecto (3 Pilares)

El proyecto está organizado en 3 pilares numerados, cada uno con un propósito distinto. Si nunca has escrito una línea de código, **este mapa es tu brújula.**

```text
Red de cad/
│
├── 📚  1_Context/          ← LA BIBLIOTECA (Documentos de referencia. Solo se leen.)
├── 📐  2_Blueprint/        ← LA SALA DE ARQUITECTURA (Reglas de negocio, esquemas de BBDD)
├── 🏭  3_Product/           ← LA FÁBRICA (El código real de la web app)
│
├── 🤖  .agent/              ← EL CEREBRO DE LA IA (Instrucciones para el agente de IA)
│   ├── core/                   └── Filosofía, estándares de calidad, Memoria de errores
│   ├── project/                └── Stack técnico, componentes, diccionario de datos
│   └── workflows/              └── master-protocol.md (Manual de operaciones de la IA)
│
├── 📄  README.md            ← ESTE ARCHIVO (Tu punto de entrada)
└── 🔒  .env.local           ← SECRETOS (Variables de entorno, no se sube a Git)
```

---

## 📚 Pilar 1: `/1_Context` — La Biblioteca

**Propósito:** Aquí vive toda la documentación oficial de la Red de CAD. El equipo técnico **lee** estos archivos para entender la historia, el tono y las necesidades de la red. Estos archivos NO se editan durante el desarrollo.

| Subcarpeta | Qué contiene | Ejemplo |
|------------|-------------|---------|
| `Bases_de_Datos_Originales/` | Los Excel brutos exportados de cada cooperativa con sus catálogos de productos | `Productos_Tierra y Libertad.xlsx` |
| `Encuentros_Presenciales/` | Actas, transcripciones y programas de los 3 encuentros presenciales de la red (Granada, Valencia, Coruña) | `Actas_III_Encuentro_Coruna_Intercoop_Economica.pdf` |
| `Memorias_Proyectos/` | Propuestas de financiación a Fundación Carasso (2020-2027) y MAPAMA | `Propuesta_Proyecto_Carasso_26_27.pdf` |
| `Otros_Documentos/` | Formularios antiguos en PDF, guías prácticas, contexto histórico | `Formulario_Diagnostico_CAD.pdf` |
| `Resultados_Proyectos/` | Memorias de resultados e informes de seguimiento (2020-2025) | `Memoria_Resultados_Carasso_24_25.pdf` |

---

## 📐 Pilar 2: `/2_Blueprint` — La Sala de Arquitectura

**Propósito:** Antes de escribir código, escribimos las reglas de negocio aquí. Cada documento `.md` define QUÉ se va a construir, POR QUÉ, y CÓMO se estructura la información. Si quieres entender cómo funciona la plataforma por dentro, lee estos archivos.

| Archivo | Qué explica | Audiencia |
|---------|------------|-----------|
| `00_Master_Roadmap.md` | Mapa de progreso: qué módulos están terminados, en construcción o planificados | PM + AI |
| `01_Intranet_Project_Plan.md` | El "Gran Por Qué": visión, usuarios, módulos, stack tecnológico | PM + AI |
| `02_Architecture_and_Methodology.md` | Reglas de código, estructura de carpetas, convenciones de naming | Developers + AI |
| `03_Products_module_blueprint.md` | Cómo funciona el "Traductor de Excel" que normaliza los productos | Developers + AI |
| `04_Pilot_Project_and_RBAC.md` | Seguridad, roles (Admin vs CAD), y el script de inicialización | Developers + AI |
| `05_Form_Methodology.md` | Por qué el formulario tiene 63 preguntas y no 80 (decisiones de diseño) | PM + AI |
| `06_Form_Content.md` | Las 63 preguntas exactas del formulario divididas en 8 bloques | PM + Content |
| `07_DB_Interconnections_and_Profiles.md` | Cómo se separan los datos públicos del perfil de los datos privados del formulario | Developers + AI |
| `08_Product_module_DB_Schema.md` | Tablas de producto: el "Diccionario" (`products`) y la "Etiqueta de Precio" (`prices_availability`) | Developers + AI |
| `09_Cad_profile_DB_Schema.md` | La tabla `cad_profiles`: columnas fijas + columnas JSONB flexibles | Developers + AI |
| `10_Architecture_Update_Log.md` | Diario de cambios arquitectónicos con sus "efectos mariposa" | AI + Developers |

---

## 🏭 Pilar 3: `/3_Product` — La Fábrica de Código

**Propósito:** El producto real que tocarán las cooperativas. Todo el desarrollo vive en `3_Product/frontend/`.

```text
3_Product/frontend/
├── app/                    ← Las páginas de la web (rutas)
│   ├── (auth)/login/          └── Página de login (email + contraseña)
│   ├── (protected)/           ← Todas las páginas que requieren autenticación
│   │   ├── dashboard/            └── Vista general de la red
│   │   ├── form/                 └── Formulario de diagnóstico (63 preguntas)
│   │   ├── profile/              └── Perfil del CAD (editable)
│   │   ├── directory/            └── Directorio de cooperativas
│   │   └── admin/                └── Panel de administración
│   ├── actions/               ← Operaciones seguras en el servidor
│   └── layout.jsx             ← Layout raíz (fuentes, toasts, HTML)
│
├── components/             ← Piezas de LEGO reutilizables
│   ├── DashboardLayout.jsx    └── La barra de navegación superior
│   ├── ErrorBoundary.jsx      └── Captura errores y muestra mensaje amigable
│   ├── TeamMemberList.jsx     └── Lista de miembros del equipo
│   ├── ToastProvider.jsx      └── Notificaciones tipo "toast"
│   └── ui/LoadingSpinner.jsx  └── Indicador de carga
│
├── config/                 ← Datos estáticos (editables sin programar)
│   ├── diagnosticForm.js      └── Las 63 preguntas del formulario
│   └── profileOptions.js     └── Opciones de dropdowns del perfil
│
├── hooks/                  ← Lógica de autenticación
│   └── useAuth.js             └── "¿Quién es este usuario? ¿Es admin?"
│
├── lib/                    ← Capa de acceso a datos
│   └── supabaseService.js     └── TODAS las operaciones CRUD centralizadas
│
├── utils/                  ← Utilidades técnicas
│   └── supabase.js            └── Conexión al backend Supabase
│
├── scripts/                ← Scripts de ejecución única
│   ├── bootstrap_admin_pass.js  └── Crea las cuentas iniciales del piloto
│   ├── add_shared_admin.js      └── Añade un nuevo administrador
│   ├── seed_pilot.js            └── Siembra datos de prueba
│   ├── check_user.js            └── Inspecciona un usuario en auth.users
│   ├── find_ghosts.js           └── Busca perfiles huérfanos sin cuenta
│   └── test_cad_login.js       └── Prueba de login de un CAD específico
│
├── db/                     ← Scripts SQL para PostgreSQL
│   ├── 00_functions_and_triggers.sql  └── Funciones RPC y triggers
│   ├── supabase_pilot_setup.sql       └── Setup completo del piloto
│   ├── supabase_profile_expansion.sql └── Migración: columnas nuevas
│   ├── supabase_products_setup.sql    └── Tablas de productos
│   ├── supabase_diagnostic_forms.sql  └── Tabla de formularios
│   ├── supabase_admin_mapping.sql     └── Tabla admin_users_mapping
│   ├── supabase_storage_and_users.sql └── Storage y cad_users_mapping
│   ├── fix_rls_policies.sql           └── Correcciones de seguridad RLS
│   ├── fix_recursion.sql              └── Fix de recursión infinita en triggers
│   ├── rpc_get_user_id.sql            └── Función RPC para buscar usuarios
│   └── seed_data.csv                  └── Datos CSV para el piloto (3 CADs)
│
└── __tests__/              ← Tests automatizados (Vitest)
    ├── setup.js               └── Configuración global de tests
    ├── mocks/supabase.js      └── Mock del cliente Supabase
    └── services/supabaseService.test.js  └── Tests del service layer
```

---

## 🤖 El Cerebro de la IA: `.agent/`

**Propósito:** El sistema de inteligencia artificial que guía el desarrollo. Contiene la filosofía, reglas, estándares técnicos, y memoria permanente del proyecto.

| Capa | Archivos | Qué hace |
|------|----------|----------|
| **🌍 Universal** (`core/`) | `methodology_manifesto.md`, `quality_gates.md`, `communication_contract.md`, `onboarding.md`, `lessons_learned.md` | Filosofía, definición de "hecho", reglas de comunicación. Portátil a cualquier proyecto |
| **🏗️ Proyecto** (`project/`) | `engineering_standards.md`, `ux_patterns.md`, `database_dictionary.md` | Stack técnico, componentes, base de datos. Específico de RedCAD |
| **📋 Plantillas** (`templates/`) | `new_project_setup.md` | Guía para configurar `.agent/` en un proyecto nuevo |
| **🚪 Entrada** (`workflows/`) | `master-protocol.md` | El "Manual del Empleado" — el sistema lo lee automáticamente |

---

## 🔧 Stack Tecnológico (Resumido)

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2.3 |
| Estilos | Tailwind CSS | 3.4.x |
| Backend | Supabase (PostgreSQL + Auth + Storage) | 2.99.0 |
| Iconos | Lucide React | 0.359.0 |
| Notificaciones | react-hot-toast | 2.6.0 |
| Testing | Vitest + Testing Library + jsdom | 4.0.x |
| Despliegue | Vercel | Auto-deploy on push to `main` |
| Fuente | Nunito (Google Fonts) | — |

---

## 💻 ¿Cómo arrancar la Intranet en tu ordenador?

### Requisitos previos
1. **Node.js** instalado (versión 18 o superior). [Descárgalo aquí](https://nodejs.org/).
2. **Git** instalado para clonar el repositorio.
3. Un archivo **`.env.local`** dentro de `3_Product/frontend/` con las siguientes variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aquí
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aquí
   ```

### Pasos para arrancar
```bash
# 1. Navega a la carpeta del frontend
cd "Red de cad/3_Product/frontend"

# 2. Instala las dependencias (solo la primera vez)
npm install

# 3. Arranca el servidor de desarrollo
npm run dev

# 4. Abre tu navegador y visita:
#    👉 http://localhost:3000
```

### Comandos disponibles
| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Arranca el servidor de desarrollo en localhost:3000 |
| `npm run build` | Compila el proyecto para producción (detecta errores) |
| `npm run lint` | Ejecuta el linter para encontrar problemas de código |
| `npm run test` | Ejecuta los tests automatizados (Vitest) |
| `npm run test:watch` | Ejecuta los tests en modo continuo (se re-ejecutan al guardar) |
| `npm start` | Arranca la versión compilada (solo después de `build`) |

---

## 📊 Estado Actual del Proyecto

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 🔐 Autenticación | ✅ Completo | Login con contraseña, gestión de admin |
| 👤 Mi Perfil | ✅ Completo | Ficha editable con semáforo de madurez |
| 📋 Formulario | ✅ Completo | 63 preguntas en 8 bloques con auto-guardado |
| 🏘️ Directorio | ✅ Completo | Listado filtrable de cooperativas |
| 🏠 Dashboard | ✅ Completo | Vista general de la red |
| ⚙️ Admin Panel | 🟡 En progreso | Gestión básica de CADs |
| 📦 Catálogo | ⏳ Pendiente | Base de datos de productos |
| 📥 Importador POD | ⏳ Pendiente | Parser de Excel → Catálogo |

---

## 🤝 Equipo y Financiación

- **Consorcio GIASAT:** CERAI + POD (Plant on Demand)
- **Financiación:** Fundación Daniel y Nina Carasso (proyecto DDF2026-0003, 299.600€, 24 meses)
- **Desarrollo:** AI-assisted (Antigravity/Claude) + PM humano
