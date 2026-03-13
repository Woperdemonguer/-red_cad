# 🔘 UI Components — Átomos de Interfaz

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Si los componentes de la carpeta padre son piezas de LEGO (una puerta, una ventana, un tejado), los componentes `ui/` son los **ladrillos individuales** — las piezas más pequeñas posibles que no tienen significado propio pero sirven para construir las demás.
>
> Un botón genérico, un spinner de carga, un separador — son "átomos" que se usan en docenas de sitios.

---

## 📋 Catálogo

| Componente | Qué VES en la pantalla | Cuándo aparece |
|------------|----------------------|---------------|
| `LoadingSpinner.jsx` | Un **círculo girando** que indica que la página está cargando datos | Mientras se conecta con la base de datos (1-2 segundos, normalmente) |

---

## 🎓 ¿Qué aprenderás aquí?

1. **Qué es "Atomic Design":** Es una metodología de diseño que organiza los componentes por tamaño:
   - **Átomos** = piezas mínimas (botón, spinner, icono) → viven en `ui/`
   - **Moléculas** = combinaciones de átomos (un campo de texto + botón de buscar)
   - **Organismos** = secciones completas (barra de navegación, formulario) → viven en `components/`
   - **Páginas** = ensamblaje final → viven en `app/`

2. **Por qué separar `ui/` de `components/`:** Los componentes en `ui/` no saben NADA del proyecto RedCAD. El `LoadingSpinner` podría usarse en cualquier otra web app. Los componentes en la carpeta padre (`DashboardLayout`, `TeamMemberList`) sí son específicos de este proyecto.
