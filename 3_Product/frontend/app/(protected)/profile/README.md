# 👤 Profile — Perfil del CAD

> **Ruta:** `/profile`
>
> **¿Qué hace esta página?**
> Permite al CAD ver y editar su perfil: datos de contacto, información de la cooperativa, logo, y miembros del equipo. Los cambios se guardan mediante `profileService` de `lib/supabaseService.js`.

> 💡 El logo se sube a Supabase Storage mediante `storageService.uploadLogo()`. Los miembros del equipo se gestionan mediante `teamService`.
