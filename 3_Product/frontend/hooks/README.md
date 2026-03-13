# 🔑 Hooks — Lógica de Estado Reutilizable

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que en un restaurante, antes de servir un plato, el camarero siempre hace lo mismo: comprueba si el cliente tiene reserva, verifica alergias, y pregunta preferencia de bebida. En vez de que cada camarero recuerde estos pasos de memoria, el restaurante crea un **protocolo** que todos siguen.
>
> Un "Hook" es ese protocolo. Es una pieza de lógica que se ejecuta automáticamente cuando una página se abre. El hook `useAuth` se encarga de: "¿Quién es este usuario? ¿Es admin o CAD? ¿Tiene permiso para ver esta página?"

---

## 📋 Catálogo de hooks

| Hook | Qué pregunta | Qué devuelve |
|------|-------------|-------------|
| `useAuth.js` | "¿Quién eres? ¿Eres admin? ¿A qué cooperativa perteneces?" | `user` (datos de sesión), `email`, `isAdmin` (sí/no), `cadId` (UUID de la cooperativa), `loading` (¿aún verificando?), `signOut` (función para cerrar sesión) |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es un "Hook" en React:** Es una función reutilizable que encapsula lógica compleja. En vez de repetir 50 líneas de código de autenticación en CADA página, escribes un hook de 120 líneas UNA vez y luego lo usas así: `const { isAdmin, email } = useAuth()`. Una línea. Limpio.

2. **Cómo funciona la autenticación en esta app:**
   ```
   Usuario abre la web
     └── useAuth() se ejecuta automáticamente
           ├── Pregunta a Supabase: "¿Hay sesión activa?"
           │     ├── NO → Redirige a /login
           │     └── SÍ → Continúa...
           ├── Pregunta (en paralelo, para ser rápido):
           │     ├── ¿Es admin? (tabla user_roles)
           │     ├── ¿Está en la lista de admins? (tabla admin_users_mapping)
           │     └── ¿A qué CAD pertenece? (tabla cad_users_mapping)
           └── Devuelve toda la info a la página
   ```

3. **Qué significa `Promise.all()`:** Es una técnica para hacer varias consultas a la base de datos AL MISMO TIEMPO (en paralelo) en vez de una detrás de otra. Si cada consulta tarda 200ms, hacerlas en serie tardaría 600ms; en paralelo tardan 200ms. Es como mandar a 3 carteros a la vez en vez de esperar a que vuelva el primero.

---

## 💡 Concepto clave: ¿Qué es un "Estado" (State)?

En las web apps modernas, la pantalla no es estática — cambia en función de datos. Cuando el hook devuelve `loading: true`, el botón muestra un spinner. Cuando devuelve `loading: false`, muestra el contenido. Eso es el **estado**: una variable que, cuando cambia, la pantalla se redibuja automáticamente. Es la magia de React.
