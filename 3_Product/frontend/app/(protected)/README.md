# 🔒 App: (protected) — Páginas Protegidas

> **¿Qué es esta carpeta?**
> Contiene todas las páginas que requieren autenticación. Si un usuario no está logueado, será redirigido a `/login`. El `layout.jsx` de esta carpeta envuelve todas las páginas con el `DashboardLayout` (navbar) y un `ErrorBoundary`.

| Subcarpeta | Ruta | Qué hace |
|:----------:|------|----------|
| `dashboard/` | `/dashboard` | Vista general de la red de cooperativas |
| `form/` | `/form` | Formulario de diagnóstico (63 preguntas en 8 bloques) |
| `profile/` | `/profile` | Perfil editable del CAD |
| `directory/` | `/directory` | Directorio de todas las cooperativas |
| `directory/[id]/` | `/directory/123` | Ficha individual de una cooperativa |
| `admin/` | `/admin` | Panel de administración (solo admins) |

> 💡 El `layout.jsx` de esta carpeta es el que decide si el usuario puede ver estas páginas. Usa `useAuth()` para verificar la sesión.
