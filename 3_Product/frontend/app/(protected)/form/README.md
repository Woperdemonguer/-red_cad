# 📝 Form — Formulario de Diagnóstico

> **Ruta:** `/form`
>
> **¿Qué hace esta página?**
> Es el formulario de diagnóstico de 63 preguntas organizado en 8 bloques temáticos. Los CADs rellenan este formulario para autoevaluar su cooperativa. Los datos se guardan automáticamente en la base de datos a medida que se avanza.

> 💡 La estructura de preguntas viene de `config/diagnosticForm.js`. El guardado usa `formService.save()` de `lib/supabaseService.js`.
