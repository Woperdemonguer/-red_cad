# 🗺️ App — Rutas y Páginas (Next.js App Router)

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina un edificio de oficinas. Cada planta tiene número de puerta. Si quieres ir a Recursos Humanos, vas a la puerta 301. Si quieres ir a Contabilidad, vas a la puerta 205.
>
> En una web app funciona igual. Cada URL es una "puerta" que lleva a una página diferente:
> - `tudominio.com/login` → Puerta de entrada (login)
> - `tudominio.com/dashboard` → El vestíbulo principal
> - `tudominio.com/form` → La sala del formulario
> - `tudominio.com/profile` → Tu despacho personal
>
> En Next.js, las carpetas DENTRO de `app/` se convierten automáticamente en URLs. Si creas una carpeta `app/tienda/page.jsx`, automáticamente aparece la URL `tudominio.com/tienda`. No hay que configurar nada extra.

---

## 🗂️ Mapa de puertas (rutas)

| URL | Carpeta | 🔒 Protegida | Qué verás |
|-----|---------|:------------:|-----------|
| `/` | `page.jsx` | ❌ | Redirige automáticamente al login |
| `/login` | `login/page.jsx` | ❌ | Formulario de email + contraseña con el logo de GIASAT |
| `/dashboard` | `(protected)/dashboard/page.jsx` | ✅ | Vista general de la red con tarjetas de acceso rápido |
| `/form` | `(protected)/form/page.jsx` | ✅ | Formulario de diagnóstico de 63 preguntas (8 bloques) |
| `/profile` | `(protected)/profile/page.jsx` | ✅ | Perfil editable del CAD: identidad, equipo, madurez |
| `/directory` | `(protected)/directory/page.jsx` | ✅ | Listado filtrable de todas las cooperativas |
| `/directory/[id]` | `(protected)/directory/[id]/` | ✅ | Ficha individual de una cooperativa |
| `/admin` | `(protected)/admin/page.jsx` | ✅ | Panel de administración (solo visible para admins) |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué son las "Rutas" en una web app:** Cada URL corresponde a una página. En Next.js, el sistema de archivos ES el sistema de rutas. No hay un archivo de configuración gigante que diga "esta URL va a esta página" — simplemente: carpeta = ruta.

2. **Qué significa `(protected)` entre paréntesis:** En Next.js, las carpetas entre paréntesis son **"Route Groups"** — agrupan páginas SIN añadir un segmento a la URL. Es decir:
   - `app/(protected)/dashboard/page.jsx` → URL: `/dashboard` (sin "/protected/" en medio)
   - El paréntesis solo sirve para que internamente todas estas páginas compartan el mismo `layout.jsx` que verifica la autenticación.
   
   Es como decir: "estas puertas están todas en la zona de seguridad del edificio (necesitas badge), pero la dirección del despacho no incluye 'zona de seguridad'."

3. **Qué significa `[id]` entre corchetes:** Es una **ruta dinámica**. Como una plantilla:
   - `/directory/abc123` → Muestra la ficha del CAD con id `abc123`
   - `/directory/xyz789` → Muestra la ficha del CAD con id `xyz789`
   - El `[id]` se reemplaza por el valor real. Es como un cajón con etiqueta variable.

4. **Qué son los archivos especiales de Next.js:**
   | Archivo | Qué hace |
   |---------|----------|
   | `page.jsx` | Define el contenido de la página (lo que ve el usuario) |
   | `layout.jsx` | Define la estructura que ENVUELVE a todas las páginas hijas (nav, sidebar, etc.) |
   | `globals.css` | Estilos globales que aplican a TODA la web app |

5. **Qué es un "Server Action":** Los archivos en `actions/` contienen operaciones que se ejecutan en el SERVIDOR, no en el navegador del usuario. ¿Por qué importa? Porque en el servidor podemos usar la `SUPABASE_SERVICE_ROLE_KEY` (la llave maestra) de forma segura. El navegador nunca la ve.
