# 🔑 Login — Página de Inicio de Sesión

> **Ruta:** `/login`
>
> **¿Qué hace esta página?**
> Es la página de entrada a la aplicación. Los usuarios (CADs y admins) introducen su email y contraseña para acceder. Tras un login exitoso, se redirige a `/dashboard`.

> 💡 Esta página es **pública** — no vive dentro de `(protected)/` y no requiere autenticación previa. Usa `authService.signIn()` de `lib/supabaseService.js`.
