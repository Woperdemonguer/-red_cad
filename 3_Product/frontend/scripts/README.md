# 🛠️ Scripts — Utilidades de Ejecución Única

> **¿Qué es esta carpeta?**
> Estos son scripts que se ejecutan UNA VEZ para preparar el entorno, crear cuentas, o diagnosticar problemas. No son parte de la aplicación web — son herramientas del equipo técnico.
>
> **Analogía:** Si la web app es un restaurante, estos scripts son las herramientas del electricista que vino a instalar la cocina. Una vez instalada, no las necesitas más (salvo para reparaciones).

---

## 📋 Catálogo de Scripts

### Scripts de Inicialización (Se ejecutan para montar el piloto)

| Script | Propósito | Cuándo ejecutarlo | Comando |
|--------|----------|-------------------|---------|
| `bootstrap_admin_pass.js` | Crea las cuentas de usuario del piloto (3 CADs + admin) a partir de `db/seed_data.csv`. Crea entradas en `auth.users` y `cad_profiles`. | Una sola vez, al inicio del piloto | `node scripts/bootstrap_admin_pass.js` |
| `add_shared_admin.js` | Añade una nueva cuenta de administrador al sistema. Crea la entrada en `auth.users` y la registra en `admin_users_mapping`. | Cada vez que se necesite un nuevo admin | `node scripts/add_shared_admin.js` |
| `seed_pilot.js` | Siembra datos de prueba adicionales para el piloto. | Una sola vez, después de `bootstrap` | `node scripts/seed_pilot.js` |

### Scripts de Diagnóstico (Se ejecutan para investigar problemas)

| Script | Propósito | Cuándo ejecutarlo | Comando |
|--------|----------|-------------------|---------|
| `check_user.js` | Inspecciona un usuario específico en `auth.users`. Muestra su UUID, email, y metadatos. | Cuando un usuario no puede loguearse | `node scripts/check_user.js` |
| `find_ghosts.js` | Busca perfiles huérfanos: filas en `cad_profiles` que no tienen una cuenta correspondiente en `auth.users`. | Después de limpiezas o migraciones | `node scripts/find_ghosts.js` |
| `test_cad_login.js` | Intenta hacer login como un CAD específico para verificar que las credenciales funcionan. | Para verificar que un CAD puede acceder | `node scripts/test_cad_login.js` |

### Scripts de Verificación Automatizada (Se ejecutan regularmente)

| Script | Propósito | Cuándo ejecutarlo | Comando |
|--------|----------|-------------------|---------|
| `smoke_test.js` | Prueba de humo — login real + operaciones CRUD contra Supabase. Detecta errores de RLS y permisos. | Después de cambios en DB/RLS/auth | `npm run test:smoke` |
| `db_health_check.js` | Valida que el esquema de la base de datos coincide con la estructura esperada. | Después de migraciones o cambios de esquema | `npm run db:check` |
| `verify_methodology.js` | Verificador de metodología — escanea el código buscando violaciones de los estándares documentados en `.agent/`. Verifica patrones de código (Categoría A) y cobertura de tests/documentación (Categoría B). | Antes de marcar cualquier trabajo como completado | `npm run verify:methodology` |

### Scripts Compuestos (Encadenan varios scripts)

| Comando | Qué Ejecuta | Cuándo Usarlo |
|---------|-------------|---------------|
| `npm run preflight` | `lint` → `build` → `test` → `verify:methodology` | Verificación rápida sin DB (offline) |
| `npm run preflight:full` | `preflight` → `db:check` → `test:smoke` | Verificación completa con DB live |

---

## ⚠️ Requisitos para ejecutar estos scripts

1. **Node.js 18+** instalado
2. **Variables de entorno** configuradas en `3_Product/frontend/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (imprescindible — los scripts usan la clave de servicio para bypasear RLS)
3. Ejecutar desde la carpeta `3_Product/frontend/`: `cd 3_Product/frontend && node scripts/<nombre>.js`

> 🔒 **Seguridad:** Estos scripts usan el `SUPABASE_SERVICE_ROLE_KEY`, que bypasea toda la seguridad RLS. Nunca compartas esta clave ni la subas a un repositorio público.

> 📝 **Nota:** `verify_methodology.js` NO requiere `.env.local` — analiza código fuente, no la base de datos. Se puede ejecutar offline.
