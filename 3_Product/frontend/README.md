# 🏭 RedCAD Hub — Frontend Developer Guide

> **¿Qué es esta carpeta?**
> Esta es la **web app real** que usan las cooperativas. Es una aplicación Next.js 14 con React, Tailwind CSS, y Supabase como backend. Todo el desarrollo técnico ocurre aquí.
>
> Si eres nuevo en el proyecto, lee primero el `README.md` de la raíz del proyecto para entender el panorama general. Este archivo se centra en cómo trabajar con el código.

---

## 🚀 Setup rápido

```bash
# 1. Asegúrate de tener Node.js 18+ instalado
node --version

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
#    Copia .env.local.example a .env.local y rellena con tus claves de Supabase
#    (Si no existe .env.local.example, crea .env.local con estas 3 variables):
#    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
#    SUPABASE_SERVICE_ROLE_KEY=xxx

# 4. Arranca el servidor de desarrollo
npm run dev

# 5. Abre: http://localhost:3000
```

---

## 📋 Comandos disponibles

| Comando | Descripción | Cuándo usarlo |
|---------|------------|---------------|
| `npm run dev` | Servidor de desarrollo con hot-reload | Desarrollo diario |
| `npm run build` | Compilación para producción | Antes de desplegar o para verificar errores |
| `npm run lint` | Ejecuta ESLint | Después de cada cambio significativo |
| `npm run test` | Ejecuta Vitest (una sola vez) | Antes de marcar una tarea como completada |
| `npm run test:watch` | Vitest en modo continuo | Durante el desarrollo de tests |
| `npm run verify:methodology` | Verifica estándares de código y cobertura de docs/tests | Antes de marcar trabajo como completado |
| `npm run preflight` | Build + tests + verify:methodology encadenados | Verificación rápida offline |
| `npm run preflight:full` | Preflight + db:check + smoke tests | Verificación completa con DB live |
| `npm start` | Arranca la build compilada | Solo en producción |

---

## 🗂️ Arquitectura de carpetas

```text
frontend/
├── app/                  ← RUTAS Y PÁGINAS (Next.js App Router)
│   ├── layout.jsx           Root layout: HTML, fuentes, <ToastProvider>
│   ├── page.jsx             Página raíz (redirige a /login)
│   ├── globals.css          Tailwind base styles
│   ├── login/page.jsx       Página de login (pública)
│   ├── (protected)/         Páginas protegidas (requieren auth)
│   │   ├── layout.jsx          Wrapper: DashboardLayout + ErrorBoundary
│   │   ├── dashboard/page.jsx  Vista general de la red
│   │   ├── form/page.jsx       Formulario de diagnóstico (9 bloques, ~90 preguntas)
│   │   ├── profile/page.jsx    Perfil editable del CAD (35+ campos, 7 secciones accordion)
│   │   ├── directory/page.jsx  Directorio de cooperativas
│   │   ├── directory/[id]/     Ficha individual de un CAD
│   │   └── admin/page.jsx      Panel de administración
│   └── actions/             Server Actions (operaciones seguras en servidor)
│       └── adminAuth.js        Gestión de contraseñas y cuentas
│
├── components/            ← PIEZAS REUTILIZABLES
│   ├── DashboardLayout.jsx    Barra de navegación superior + layout
│   ├── ErrorBoundary.jsx      Captura errores de renderizado
│   ├── TeamMemberList.jsx     Lista editable de personas de contacto
│   ├── ToastProvider.jsx      Componente global de notificaciones
│   ├── ui/LoadingSpinner.jsx  Spinner de carga animado
│   └── form/MatrixQuestion.jsx Componente de matriz para evaluaciones
│
├── config/                ← DATOS ESTÁTICOS (editables sin programar)
│   ├── diagnosticForm.js     ~90 preguntas del formulario en 9 bloques temáticos
│   └── profileOptions.js    Opciones de selects, checkbox groups, categorías de madurez
│
├── hooks/                 ← LÓGICA DE ESTADO
│   └── useAuth.js            Hook de autenticación (único source of truth)
│
├── lib/                   ← CAPA DE ACCESO A DATOS
│   ├── supabaseService.js    5 servicios: profile, form, team, storage, auth
│   └── formUtils.js          Lógica config-driven: visibilidad condicional, progreso
│
├── utils/                 ← UTILIDADES
│   └── supabase.js           Cliente Supabase (conexión al backend)
│
├── scripts/               ← Scripts de ejecución única (ver scripts/README.md)
├── db/                    ← Scripts SQL (ver db/README.md)
├── __tests__/             ← Tests automatizados (Vitest)
├── public/                ← Archivos estáticos (favicon, imágenes)
│
├── tailwind.config.js     ← Paleta de colores, fuentes y animaciones
├── vitest.config.js       ← Configuración de tests (jsdom, aliases)
├── jsconfig.json          ← Alias de importación (@/ → ./)
├── postcss.config.js      ← Procesador de CSS (para Tailwind)
└── package.json           ← Dependencias y scripts npm
```

---

## 🎨 Paleta de colores

Definida en `tailwind.config.js`. Usar SIEMPRE nombres semánticos, nunca hex directo.

| Token | Hex | Uso |
|-------|-----|-----|
| `forest` | `#2E5339` | Botones principales, headers |
| `forestLight` | `#3c6b4a` | Hover de forest |
| `sage` | `#8BAA7C` | Texto secundario, badges |
| `cream` | `#FFFFFF` | Fondos de tarjetas |
| `sand` | `#F5F7FA` | Fondos de página |
| `accent` | `#E8A923` | CTAs, highlights |
| `accentHover` | `#D49A1A` | Hover de accent |
| `text` | `#1A202C` | Texto principal |
| `textLight` | `#718096` | Texto secundario |

---

## 🔐 Variables de entorno

| Variable | Dónde se usa | ¿Pública? |
|----------|:------------|:---------:|
| `NEXT_PUBLIC_SUPABASE_URL` | `utils/supabase.js` (cliente) | ✅ Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `utils/supabase.js` (cliente) | ✅ Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/actions/adminAuth.js` (servidor) | ❌ **NUNCA** |

> ⚠️ **CRÍTICO:** El `SUPABASE_SERVICE_ROLE_KEY` bypasea TODA la seguridad RLS. Si se filtra a código del cliente, cualquier usuario podría leer/escribir toda la base de datos. Solo se usa en Server Actions.

---

## 🔐 Modelo de Autenticación

Cada CAD tiene **una única cuenta** en Supabase Auth (email + contraseña):

```text
Supabase Auth (1 user per CAD)
    │
    ├── cad_users_mapping    email → cad_id (resolución de CAD + directorio de contactos)
    ├── admin_users_mapping   email → admin (whitelist de administradores)
    └── user_roles            user_id → 'admin' (roles de sistema)
```

| Concepto | Detalle |
|----------|--------|
| **Login** | `signInWithPassword` (email + contraseña) |
| **Resolución de CAD** | `useAuth()` consulta `cad_users_mapping` por email → obtiene `cad_id` |
| **Admin detection** | Doble check: `user_roles.role = 'admin'` OR `admin_users_mapping` |
| **Cambio de contraseña** | CAD: `supabase.auth.updateUser()` desde `/profile` |
| **Reset de contraseña** | Admin: Server Action `adminResetUserPassword()` desde `/admin` |
| **Personas de contacto** | `cad_users_mapping` — directorio de equipo del CAD (no login) |

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Modo watch (se re-ejecutan al guardar)
npm run test:watch
```

- **Framework:** Vitest 4.x + Testing Library 16.x + jsdom 28.x
- **Tests existentes:** 98 tests en 5 archivos (services, hooks, components, lib, scripts)
- **Mocks:** `__tests__/mocks/supabase.js` (mock del cliente Supabase)
- **Setup global:** `__tests__/setup.js`
- **Verificación:** `npm run verify:methodology` (9 checks de patrones de código + cobertura de docs/tests)
