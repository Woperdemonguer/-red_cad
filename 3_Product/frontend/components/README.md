# 🧩 Components — Piezas Reutilizables de LEGO

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que estás montando muebles de IKEA. No construyes cada mueble desde cero — usas **piezas prefabricadas** (patas, tablas, bisagras) que se combinan para crear diferentes muebles. Una misma pata puede servir para una mesa, una silla o una estantería.
>
> En programación web, estas piezas se llaman **componentes**. Un componente es un bloque visual reutilizable: un botón, una barra de navegación, un spinner de carga. Se construye UNA vez y se usa en muchas páginas.

---

## 📋 Catálogo de componentes

| Componente | Qué VES en la pantalla | Dónde se usa |
|------------|----------------------|-------------|
| `DashboardLayout.jsx` | La **barra de navegación** en la parte superior con el logo, los enlaces (Dashboard, Perfil, Formulario, Directorio) y el botón de cerrar sesión | En TODAS las páginas protegidas |
| `ErrorBoundary.jsx` | Una **pantalla de error amigable** con un emoji ⚠️ y un botón "Recargar página" (en vez de una pantalla blanca rota) | Envuelve todas las páginas protegidas |
| `TeamMemberList.jsx` | La **tabla editable de miembros del equipo** donde puedes añadir, editar o eliminar personas | En la página de Perfil y en Admin |
| `ToastProvider.jsx` | Las **notificaciones** que aparecen brevemente en esquina de la pantalla ("Guardado ✓", "Error ✗") | Global (siempre activo) |
| `ui/` | Subcarpeta de componentes **genéricos** sin contexto de negocio | Ver `ui/README.md` |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es un "componente" en React:** Un trozo de código que genera una parte visual de la página. Tiene su propio HTML, sus estilos y su comportamiento. Puedes pensarlo como un **widget** autocontenido.

2. **Por qué se crean componentes separados (en vez de un archivo gigante):**
   - **Reutilización:** El `DashboardLayout` se usa en 6 páginas. Si cambiamos el logo, lo cambiamos en UN sitio y se actualiza en las 6.
   - **Legibilidad:** Es más fácil leer un archivo de 50 líneas que uno de 500.
   - **Testeo:** Puedes probar cada pieza por separado, como probar las ruedas de un coche antes de montarlas.

3. **Qué significa `.jsx`:** Es la extensión de archivo de React. Mezcla JavaScript (la lógica) con HTML (la estructura visual). El `.jsx` le dice al ordenador: "este archivo contiene código que genera páginas web".

---

## 💡 Concepto clave: ¿Qué es un "Error Boundary"?

Cuando algo falla en una web app normal, la pantalla se queda en blanco. El usuario no sabe qué ha pasado. Un **Error Boundary** es como una red de seguridad en un trapecio: si algo falla, en vez de blanco mortal, muestra un mensaje amigable: "Algo no ha ido bien. Puedes recargar la página." Mucho mejor para el usuario.
