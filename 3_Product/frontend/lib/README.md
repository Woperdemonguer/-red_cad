# 📦 Lib — La Capa de Acceso a Datos

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que estás en un hotel y necesitas una toalla extra. NO bajas al almacén a buscarla tú mismo — **llamas a recepción** y ellos te la traen. Recepción sabe dónde están las toallas, cómo llegar, y se encarga de todo el proceso.
>
> Esta carpeta es "recepción". Las páginas de la web (los componentes) NUNCA van directamente a la base de datos — llaman a las funciones de aquí, y estas funciones se encargan de buscar, guardar, actualizar o borrar datos.

---

## 📋 ¿Qué hay dentro?

| Archivo | Servicios que ofrece | Base de Datos que toca |
|---------|---------------------|----------------------|
| `supabaseService.js` | 5 servicios con ~18 funciones en total | 5 tablas + Storage + Auth |
| `formUtils.js` | Lógica config-driven para el formulario | Ninguna (pura lógica) |

### Detalle de los 5 servicios de `supabaseService.js`:

| Servicio | Funciones | Para qué sirve | Analogía |
|----------|:---------:|----------------|----------|
| `profileService` | 7 | Leer, crear, editar y borrar perfiles de cooperativas | La ficha de cada socio en el archivo de una asociación |
| `formService` | 3 | Cargar y guardar las ~90 respuestas del formulario de diagnóstico | El sistema de guardado automático de un documento de Google |
| `teamService` | 5 | Gestionar personas de contacto (añadir, editar, eliminar personas) | La lista de contactos de RRHH |
| `storageService` | 1 | Subir logos e imágenes al servidor | Subir una foto de perfil a WhatsApp |
| `authService` | 2 | Login (`signIn`) y obtener token de sesión (`getAccessToken`) | La tarjeta de acceso al edificio |

### `formUtils.js` — Lógica del formulario:

| Función | Para qué sirve |
|---------|----------------|
| `shouldShowQuestion()` | Determina si una pregunta debe mostrarse según respuestas previas (condicionales `showWhen`) |
| `calculateProgress()` | Calcula el % de progreso del formulario contando solo preguntas visibles |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es un "Service Layer" (Capa de Servicio):** Es un intermediario entre la interfaz (lo que ves) y la base de datos (donde viven los datos). ¿Por qué el intermediario? Tres razones:
   - **Control centralizado:** Si cambias cómo se guardan los datos, lo cambias en UN archivo, no en 15.
   - **Seguridad:** Puedes añadir validaciones y controles de acceso en un solo punto.
   - **Testabilidad:** Puedes probar el servicio sin abrir el navegador.

2. **La regla de oro de esta carpeta:**
   > **Las páginas NUNCA hablan directamente con la base de datos.** Siempre pasan por `supabaseService.js`.
   >
   > ❌ MAL: `const datos = await supabase.from("cad_profiles").select("*")`
   > ✅ BIEN: `const datos = await profileService.list()`
   
   La segunda versión es más legible, más segura, y más fácil de mantener.

3. **Qué es un "CRUD":** Es el acrónimo de las 4 operaciones básicas con datos:
   - **C**reate (Crear) → `profileService.create("Nuevo CAD")`
   - **R**ead (Leer) → `profileService.get(cadId)` o `profileService.list()`
   - **U**pdate (Actualizar) → `profileService.update(cadId, datos)`
   - **D**elete (Borrar) → `profileService.delete(cadId)`
   
   Todo software del mundo se reduce a estas 4 operaciones sobre datos.

---

## 💡 Concepto clave: ¿Qué es un "Upsert"?

La función `formService.save()` usa un `upsert` — una fusión de "update" (actualizar) + "insert" (insertar). Significa: "Si ya existe una fila para este email, actualízala. Si no existe, créala nueva." Es como decir: "Guárdame este archivo. Si ya existe, sobreescríbelo. Si no, crea uno nuevo." Supabase lo hace en una sola operación, sin que la página tenga que preguntar "¿ya existe o no?".
