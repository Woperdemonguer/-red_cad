# 💾 DB — Scripts SQL para PostgreSQL (Supabase)

> **¿Qué es esta carpeta?**
> Estos son los scripts SQL que definen la estructura de la base de datos. Cada archivo crea tablas, funciones, triggers, o políticas de seguridad en PostgreSQL (vía el editor SQL de Supabase).
>
> **Analogía:** Si la base de datos es un almacén, estos scripts son los planos que dicen dónde va cada estantería, cada cerrojo y cada cámara de vigilancia. Se ejecutan una vez para "construir el almacén" y luego solo se tocan cuando se amplia o remodelamos.

---

## 🛡️ Reglas de Oro (Golden Rules)

> **⚠️ NUNCA** uses `(SELECT email FROM auth.users WHERE id = auth.uid())` en políticas RLS.
> Esto causa "permission denied for table users" para usuarios no-admin.
>
> **✅ SIEMPRE** usa `(auth.jwt() ->> 'email')` para obtener el email del usuario actual.
> Esto lee directamente del token JWT sin necesitar acceso a tabla alguna.

> **⚠️ NUNCA** hagas que una política RLS de una tabla haga `SELECT` de sí misma.
> Esto causa "infinite recursion detected in policy for relation". Ejemplo:
> ```sql
> -- ❌ PROHIBIDO: admin_users_mapping policy que consulta admin_users_mapping
> CREATE POLICY "..." ON admin_users_mapping USING (
>     EXISTS (SELECT 1 FROM admin_users_mapping WHERE ...)
> );
> -- ✅ CORRECTO: usar comparación directa o consultar user_roles
> CREATE POLICY "..." ON admin_users_mapping FOR SELECT USING (
>     user_email = (auth.jwt() ->> 'email')
> );
> ```

> **⚠️ NUNCA** hagas deploy de cambios de DB sin verificar:
> 1. `npm run db:check` — Valida que el esquema es correcto
> 2. `npm run test:smoke` — Prueba operaciones reales como un usuario CAD

---

## 📋 Catálogo de Scripts SQL

### Setup Inicial (Orden de ejecución recomendado)

| # | Archivo | Qué hace | Tablas afectadas |
|:-:|---------|----------|-----------------| 
| 1 | `00_functions_and_triggers.sql` | Crea las funciones RPC y triggers automáticos (ej: `handle_new_user()`) | Todas (funciones globales) |
| 2 | `supabase_pilot_setup.sql` | Setup completo del piloto: tabla `cad_profiles` con todas sus columnas, RLS policies de lectura/escritura | `cad_profiles` |
| 3 | `supabase_diagnostic_forms.sql` | Crea la tabla `diagnostic_forms` para almacenar las 63 respuestas del formulario | `diagnostic_forms` |
| 4 | `supabase_products_setup.sql` | Crea las tablas `products` (diccionario) y `prices_availability` (oferta por CAD) | `products`, `prices_availability` |
| 5 | `supabase_admin_mapping.sql` | Crea la tabla `admin_users_mapping` que identifica qué usuarios son administradores | `admin_users_mapping` |
| 6 | `supabase_storage_and_users.sql` | Configura el bucket de Storage `cad_media` y la tabla `cad_users_mapping` | Storage, `cad_users_mapping` |

### Migraciones (Se ejecutan después del setup cuando hay cambios)

| Archivo | Qué hace | Cuándo ejecutarlo |
|---------|----------|-------------------|
| `supabase_profile_expansion.sql` | Añade columnas nuevas a `cad_profiles`: `estado`, `grupo_motor`, `perfiles_equipo`, `propiedad_instalaciones` | Cuando se necesiten nuevos campos en el perfil |

### Fixes (Se ejecutan para corregir problemas específicos)

| Archivo | Qué corrige |
|---------|-------------|
| `fix_all_rls_auth_users.sql` | **FIX MAESTRO**: Corrige TODAS las políticas RLS que usaban `auth.users` (28+ políticas en 6 tablas) + elimina recursión infinita en `admin_users_mapping` y `cad_users_mapping` + añade UNIQUE constraint en `diagnostic_forms.user_email`. **Seguro re-ejecutar.** |
| `fix_admin_cad_users_rls.sql` | Añade políticas RLS para que el **admin pueda ver/gestionar** los team members de cualquier CAD (tabla `cad_users_mapping`). Corrige el bug donde el admin no podía ver los contactos al editar un perfil. |
| `fix_rls_policies.sql` | Corrige políticas RLS (ya actualizado para usar `auth.jwt()`) |
| `fix_recursion.sql` | Corrige un bug donde un trigger se llamaba a sí mismo infinitamente |
| `apply_fix_diagnostic_forms.sql` | Fix puntual para `diagnostic_forms` (superseded by `fix_all_rls_auth_users.sql`) |

### Funciones Auxiliares

| Archivo | Qué hace |
|---------|----------|
| `rpc_get_user_id.sql` | Crea una función RPC (`SECURITY DEFINER`) que busca un usuario por email y devuelve su UUID |

### Datos Semilla

| Archivo | Qué contiene |
|---------|-------------|
| `seed_data.csv` | Los datos de los 3 CADs del piloto (nombre, email, teléfono, territorio, logo URL) |

---

## ⚠️ Cómo ejecutar estos scripts

1. Ve al **Dashboard de Supabase** de tu proyecto → **SQL Editor**
2. Copia y pega el contenido del archivo `.sql`
3. Haz clic en **Run**
4. Verifica que no hubo errores
5. **SIEMPRE** ejecuta `npm run db:check` y `npm run test:smoke` después

> 🛡️ **Seguridad:** Todos los scripts son **idempotentes** — usan `IF NOT EXISTS`, `DROP POLICY IF EXISTS`, y `ADD COLUMN IF NOT EXISTS`, por lo que es seguro ejecutarlos más de una vez sin romper nada.

---

## 🏗️ El Mapa de Tablas

```text
auth.users (Supabase Auth)
    │
    ├── user_roles         (role: 'admin' | 'user')
    ├── cad_users_mapping  (user_email → cad_id)
    ├── admin_users_mapping (whitelist de admins)
    │
    └── cad_profiles       (LA TABLA CENTRAL)
         │
         ├── diagnostic_forms   (63 respuestas, privadas)
         ├── products           (diccionario de productos)
         └── prices_availability (oferta por CAD por producto)
```

---

## 🔧 Scripts de Validación

| Comando | Qué hace |
|---------|----------|
| `npm run db:check` | Valida que el esquema de la BD live coincide con lo esperado (tablas, columnas, RLS) |
| `npm run test:smoke` | Inicia sesión como usuario CAD y prueba operaciones reales (cargar/guardar formulario, leer perfiles, etc.) |
| `npm run test` | Ejecuta los tests unitarios con Vitest |
