# ⚙️ Admin — Panel de Administración

> **Ruta:** `/admin`
>
> **¿Qué hace esta página?**
> Panel exclusivo para administradores. Permite gestionar cuentas de usuario, resetear contraseñas, ver el estado global de la red, y realizar acciones administrativas que requieren permisos elevados.

> 💡 Esta página verifica el rol del usuario mediante `useAuth()`. Si un CAD (no admin) intenta acceder, será redirigido. Las operaciones de admin usan Server Actions (`app/actions/adminAuth.js`) que ejecutan con `SUPABASE_SERVICE_ROLE_KEY` en el servidor.
