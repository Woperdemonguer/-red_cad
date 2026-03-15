# 🧪 Tests: Scripts — Tests del Verificador de Metodología

> **¿Qué hay aquí?**
> Tests que verifican que el propio sistema de verificación (`verify_methodology.js`) funciona correctamente — detecta violaciones reales y no produce falsos positivos.

| Archivo | Qué testea | Nº de tests |
|---------|-----------|:-----------:|
| `verify_methodology.test.js` | Que el verificador pasa en código limpio, detecta violaciones reales (A1, A3, A4), respeta whitelists, y produce el formato correcto | 11 |

> 💡 Sí, esto es "tests de los tests" — el verificador de estándares necesita sus propios tests para asegurar que no dará falsos positivos (que erosionarían la confianza en el sistema). Ver Directive 19 en `lessons_learned.md`.
