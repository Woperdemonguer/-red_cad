# 🎭 Mocks — Simulaciones para Tests

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Cuando los bomberos entrenan, no prenden fuego a un edificio real — usan un **simulador**. Lo mismo cuando los pilotos practican con un simulador de vuelo. Los mocks son simuladores para software: imitan el comportamiento de servicios externos (como la base de datos) para poder probar el código sin riesgo.

---

## 📋 ¿Qué hay dentro?

| Archivo | Qué simula | Por qué |
|---------|-----------|---------|
| `supabase.js` | El cliente Supabase completo: `.from()`, `.select()`, `.eq()`, `.single()`, etc. | Para que los tests no necesiten conexión real a la base de datos |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Por qué NO se usa la base de datos real en los tests:**
   - **Velocidad:** Un mock responde en 0ms. Una base de datos real tarda 50-200ms por query.
   - **Seguridad:** No quieres que los tests borren datos de producción.
   - **Independencia:** Los tests deben funcionar sin WiFi, sin Supabase, sin nada externo.
   - **Repetibilidad:** El mock siempre devuelve los mismos datos. La base de datos real puede tener datos diferentes cada día.

2. **Cómo funciona un mock:** El mock "intercepta" las llamadas a Supabase. Cuando el código dice `supabase.from("cad_profiles").select("*")`, en vez de ir a Internet, el mock responde directamente con datos de prueba predefinidos. El código no sabe la diferencia.
