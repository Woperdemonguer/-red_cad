# 🔬 Services Tests — Probando la Capa de Datos

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Si `lib/supabaseService.js` es la "recepción" del hotel que gestiona todas las peticiones de datos, este archivo es el **inspector de calidad** que verifica que la recepción funciona correctamente:
> - ¿Le pido un perfil y me lo devuelve?
> - ¿Le pido guardar un formulario y lo guarda?
> - ¿Si hay un error, me avisa correctamente?

---

## 📋 ¿Qué hay dentro?

| Archivo | Qué testea | Nº de tests |
|---------|-----------|:-----------:|
| `supabaseService.test.js` | Las 16 funciones de los 4 servicios: `profileService`, `formService`, `teamService`, `storageService` | Variable (crece con el proyecto) |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Cómo se estructura un archivo de test:** Cada test sigue el patrón "Arrange → Act → Assert" (Preparar → Ejecutar → Verificar):
   ```
   1. PREPARAR: Configura los datos de prueba y los mocks
   2. EJECUTAR: Llama a la función que quieres probar
   3. VERIFICAR: Comprueba que el resultado es el esperado
   ```
   Es como una receta de cocina: preparas los ingredientes, cocinas, y pruebas el resultado.

2. **Qué es un "Test Suite":** Un conjunto de tests agrupados por tema. En este archivo, los tests están agrupados por servicio:
   ```
   📂 supabaseService
     📂 profileService
       ✓ get() devuelve un perfil por ID
       ✓ list() filtra perfiles vacíos
     📂 formService
       ✓ save() guarda las respuestas
     📂 teamService
       ✓ add() añade un miembro
   ```
