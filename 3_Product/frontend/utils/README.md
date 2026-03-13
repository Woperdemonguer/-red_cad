# 🔧 Utils — Utilidades Técnicas

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Si `lib/` es la recepción del hotel (gestiona las peticiones), `utils/` es la **llave maestra** — la herramienta básica que recepción necesita para conectarse con el almacén.
>
> En concreto, este archivo crea la "conexión" entre la web app y la base de datos Supabase. Sin esta conexión, la app no puede guardar ni leer datos.

---

## 📋 ¿Qué hay dentro?

| Archivo | Qué hace | Depende de |
|---------|----------|-----------|
| `supabase.js` | Crea el **cliente Supabase** (la conexión) usando la URL y la clave anónima del `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es un "Cliente":** En programación, un cliente es un programa que se conecta a otro programa. Tu navegador es un "cliente" de Google cuando buscas algo. En nuestro caso, `supabase.js` crea un cliente que se conecta al servidor de Supabase donde viven los datos.

2. **Qué son las claves de entorno:** Las claves `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son como la **dirección** y la **contraseña del WiFi** de Supabase:
   - La URL dice DÓNDE está Supabase (la dirección del servidor)
   - La clave anónima dice QUIÉN eres (para que Supabase te deje entrar, pero solo con los permisos normales de usuario)

3. **Qué es la diferencia entre "Anon Key" y "Service Role Key":**
   | Clave | Quién la usa | Qué puede hacer | Dónde vive |
   |-------|:------------|:---------------|:-----------|
   | Anon Key | El navegador del usuario | Solo lo que las políticas RLS permitan | `utils/supabase.js` |
   | Service Role Key | El servidor (Server Actions) | **TODO** — bypasea toda la seguridad | `app/actions/adminAuth.js` |
   
   > ⚠️ Si alguien obtiene la Service Role Key, puede leer y borrar TODA la base de datos. Por eso NUNCA aparece en código del navegador.
