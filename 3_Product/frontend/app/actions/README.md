# 🔐 Actions — Server Actions (Operaciones Seguras)

> **¿Qué es esta carpeta?**
> Contiene **Server Actions** de Next.js — funciones que se ejecutan en el servidor, no en el navegador. Esto permite realizar operaciones que requieren la clave de servicio de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) sin exponerla al cliente.

| Archivo | Propósito |
|---------|-----------|
| `adminAuth.js` | Gestión de contraseñas y cuentas de usuario (crear, resetear, cambiar contraseña) |

> ⚠️ **Seguridad:** Estos archivos usan el `SUPABASE_SERVICE_ROLE_KEY` que bypasea las políticas RLS. Cualquier error aquí puede exponer TODA la base de datos. Verificar con extremo cuidado.
