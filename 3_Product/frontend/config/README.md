# 📋 Config — Datos Estáticos Editables

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que el formulario de diagnóstico es una **entrevista grabada en un CD**. Si quieres cambiar una pregunta, no necesitas regrabar todo el CD — solo necesitas cambiar el **guión** (el papel con las preguntas escritas). La entrevista usa el guión actualizado automáticamente.
>
> Esta carpeta es ese guión. Contiene las preguntas del formulario y las opciones de los desplegables en archivos separados del código. Si mañana quieres cambiar el texto de la pregunta 1.3, solo abres el archivo, cambias el texto, guardas, y la web se actualiza sola.

---

## 📋 Catálogo de archivos

| Archivo | Contenido | Nº de items | ¿Editable sin programar? |
|---------|----------|:-----------:|:------------------------:|
| `diagnosticForm.js` | Las ~90 preguntas del formulario divididas en 9 bloques temáticos, con tooltips, condicionales `showWhen`, y separadores de sección | ~90 preguntas | ✅ Sí (solo texto) |
| `profileOptions.js` | Opciones de selects, checkbox groups, categorías de madurez (11), intercooperación (11), CCAA (18), forma jurídica, gobernanza, criterios compras | ~60 opciones | ✅ Sí (solo texto) |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es "separar configuración de código":** Es una práctica fundamental en software. Significa que los DATOS (las preguntas, las opciones) viven separados de la LÓGICA (cómo se muestra el formulario). Así, una persona no técnica puede cambiar el contenido sin tocar el mecanismo.

2. **Cómo editar una pregunta del formulario:**
   ```
   Paso 1: Abre config/diagnosticForm.js
   Paso 2: Busca el id de la pregunta (ej: "1.3")
   Paso 3: Cambia el texto en el campo "q" (de "question")
   Paso 4: Guarda el archivo
   Paso 5: La web se actualiza automáticamente (hot-reload)
   ```

3. **Cómo añadir una opción a un desplegable:**
   ```
   Paso 1: Abre config/profileOptions.js
   Paso 2: Busca el array (lista) donde quieras añadir
   Paso 3: Añade un nuevo texto entre comillas, con coma al final
   Paso 4: Guarda
   ```

4. **Qué es un "tooltip":** Es un cuadro de texto explicativo que aparece cuando pasas el ratón por encima de un elemento. Los tooltips de las 10 categorías de madurez están definidos aquí.

---

## 💡 Concepto clave: ¿Qué es un "Array"?

Un **array** es una lista ordenada de elementos. En estos archivos, verás cosas como:
```javascript
["Planificación productiva", "Gestión comercial", "Costes de producción"]
```
Eso es un array de 3 textos. Los corchetes `[ ]` marcan el inicio y fin de la lista. Las comas `,` separan los elementos. Las comillas `" "` delimitan cada texto.
