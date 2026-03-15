# 🧪 __tests__ — Tests Automatizados

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que trabajas en una fábrica de coches. Antes de vender un coche, lo pones en un **banco de pruebas**: ¿frena bien? ¿se enciende el motor? ¿funciona el airbag? No esperas a que un cliente tenga un accidente para descubrirlo.
>
> Los tests automatizados hacen lo mismo con el software. Son programas que **verifican automáticamente** que el código funciona correctamente. Cada vez que modificas algo, ejecutas los tests y te dicen: "todo OK" o "has roto X cosa".

---

## 📋 ¿Qué hay dentro?

| Carpeta/Archivo | Propósito | Analogía |
|-----------------|-----------|----------|
| `setup.js` | Configuración global que se ejecuta ANTES de cada batería de tests | Encender la máquina del banco de pruebas |
| `mocks/supabase.js` | Simulación del cliente Supabase (datos falsos) | Un maniquí de pruebas de choque (simula un humano sin serlo) |
| `services/supabaseService.test.js` | Tests del service layer — verifican que las 19 funciones de datos funcionan | Las pruebas de freno, motor y luces |
| `hooks/useAuth.test.js` | Tests del hook de autenticación | Verificar que la puerta de seguridad funciona |
| `components/ui.test.jsx` | Tests de componentes de UI (modales, spinners, toasts) | Verificar que los indicadores del tablero se encienden |
| `lib/formUtils.test.js` | Tests de utilidades de formularios | Verificar que la calculadora funciona |
| `scripts/verify_methodology.test.js` | Tests del verificador de metodología (9 checks automatizados) | Verificar que el inspector de calidad no tiene fallos |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Por qué se hacen tests (si ya puedes "probar a mano"):** Porque los humanos nos saltamos cosas. Y porque una app tiene decenas de funciones que habría que probar CADA VEZ que cambias algo. Los tests automatizados prueban todo en 2 segundos. A mano tardarías 30 minutos y te olvidarías de la mitad.

2. **Qué es un "Mock" (Simulación):** Para testear el código que habla con la base de datos, NO quieres conectarte a la base de datos real (podrías borrar datos o gastar cuota). En vez de eso, creas un "impostor" (`mocks/supabase.js`) que SIMULA ser Supabase y devuelve datos ficticios. El código no nota la diferencia.

3. **Cómo se ejecutan los tests:**
   ```bash
   # Ejecutar todos los tests una vez
   npm run test
   
   # Resultado: ✅ 5 test files, 98 tests passed
   
   # Modo continuo (se re-ejecutan cada vez que guardas un archivo)
   npm run test:watch
   
   # Verificación de metodología (no tests, sino checks de estándares)
   npm run verify:methodology
   ```

4. **Cómo se lee un resultado de test:**
   ```
   ✅ PASS  services/supabaseService.test.js
     profileService
       ✓ get() devuelve un perfil por ID (5ms)
       ✓ list() filtra perfiles sin nombre (3ms)
       ✓ update() incluye todos los campos (2ms)
     formService
       ✓ save() usa upsert con email como clave (4ms)
   ```
   Cada `✓` es una prueba que ha pasado. Si algo fallara, verías una `✗` con el detalle del error.

---

## 💡 Concepto clave: ¿Qué es la "Confianza del Refactor"?

Refactorizar = reorganizar el código sin cambiar su comportamiento. Es como reordenar los muebles de una habitación: todo sigue funcionando, pero está mejor organizado. El problema es: ¿cómo sabes que no has roto nada al mover cosas? **Los tests.** Si todos pasan después de reorganizar, tienes la confianza de que no has roto nada. Sin tests, refactorizar es aterrador.
