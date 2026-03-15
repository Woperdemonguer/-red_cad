# 🏢 Directory: [id] — Ficha Individual de un CAD

> **Ruta:** `/directory/[id]` (ej: `/directory/abc123`)
>
> **¿Qué hace esta página?**
> Muestra la ficha completa de una cooperativa específica: su perfil, miembros del equipo, resultados del diagnóstico, y datos de contacto. El `[id]` en la URL corresponde al UUID del CAD en la base de datos.

> 💡 Esta es una **ruta dinámica** de Next.js. El parámetro `id` se usa para llamar a `profileService.get(id)` y cargar los datos de esa cooperativa.
