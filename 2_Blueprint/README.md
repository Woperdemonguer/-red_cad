# 📐 2_Blueprint — La Sala de Arquitectura

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina que vas a construir una casa. Antes de comprar ladrillos, contratas a un arquitecto que dibuja los **planos**: dónde van las paredes, las tuberías, las ventanas. Si te saltas los planos y empiezas a construir directamente, la casa se cae.
>
> En software pasa lo mismo. Esta carpeta contiene los "planos" de la plataforma RedCAD Hub. Cada archivo `.md` define QUÉ se va a construir, POR QUÉ se hace así, y CÓMO se estructura la información. El equipo técnico lee estos planos ANTES de escribir una sola línea de código.

---

## 📋 Formato "Dual-Optimization"

Todos los archivos siguen un formato estandarizado pensado para DOS audiencias:

| Audiencia | Qué encuentra | Ejemplo |
|-----------|--------------|---------|
| 🤖 La IA | Cabecera YAML con dependencias, tablas técnicas, Data Contracts en TypeScript | `AI_Context: { Domain: "Database Schema" }` |
| 🧑‍💼 El PM humano | Analogías en lenguaje coloquial, tablas resumen, diagramas ASCII | "Piensa en la base de datos como un armario con cajones etiquetados" |

---

## 📚 Índice de archivos (Orden de lectura recomendado)

| # | Archivo | Qué explica | Nivel |
|:-:|---------|------------|:-----:|
| 00 | `00_Master_Roadmap.md` | El mapa de progreso: qué módulos están terminados, en construcción o pendientes | 🟢 Fácil |
| 01 | `01_Intranet_Project_Plan.md` | La visión completa del producto: usuarios, módulos, tecnologías, diseño | 🟢 Fácil |
| 02 | `02_Architecture_and_Methodology.md` | Las reglas de código y la estructura de carpetas | 🟡 Intermedio |
| 03 | `03_Products_module_blueprint.md` | Cómo el "Traductor de Excel" normaliza catálogos de productos | 🟡 Intermedio |
| 04 | `04_Pilot_Project_and_RBAC.md` | Seguridad, roles (Admin vs CAD), y cómo se crean las cuentas | 🟡 Intermedio |
| 05 | `05_Form_Methodology.md` | Por qué el formulario tiene 63 preguntas y cómo se diseñó | 🟢 Fácil |
| 06 | `06_Form_Content.md` | Las 63 preguntas exactas divididas en 8 bloques | 🟢 Fácil |
| 07 | `07_DB_Interconnections_and_Profiles.md` | Cómo se separan los datos públicos de los privados | 🟡 Intermedio |
| 08 | `08_Product_module_DB_Schema.md` | Las tablas de productos en la base de datos | 🔴 Técnico |
| 09 | `09_Cad_profile_DB_Schema.md` | La tabla central `cad_profiles` | 🔴 Técnico |
| 10 | `10_Architecture_Update_Log.md` | Diario de cambios arquitectónicos con sus "efectos mariposa" | 🟡 Intermedio |

---

## 🎓 ¿Qué aprenderás leyendo estos archivos?

1. **Qué es un "Blueprint":** Un documento de planificación que describe QUÉ se va a construir antes de construirlo. En arquitectura tradicional se llaman planos. En software se llaman especificaciones o blueprints.

2. **Por qué se escribe ANTES de programar:** Porque las decisiones tomadas sin planificación son caras de corregir. Es más barato cambiar un párrafo en un documento que reescribir 500 líneas de código.

3. **Qué es un "Data Contract":** Un acuerdo formal sobre la forma exacta que tendrán los datos. Es como decir:
   > "El campo `nombre_comercial` será SIEMPRE un texto. El campo `ano_constitucion` será SIEMPRE un número entero. El campo `madurez_evaluacion` será SIEMPRE un objeto JSON con 10 claves."
   
   Si todos los que tocan los datos respetan este contrato, nada se rompe.

4. **Qué es RBAC:** Role-Based Access Control (Control de Acceso Basado en Roles). Significa que lo que puedes ver y hacer en la plataforma depende de tu ROL. Un "Admin" puede crear cuentas. Un "CAD" solo puede editar su propio perfil. Es como las llaves de un hotel: la llave del huésped abre su habitación, pero la llave maestra del conserje abre todas.

---

## ⚠️ Regla importante

> Esta carpeta **solo contiene archivos `.md`** (documentos de texto). No se almacena código, datos ni configuraciones aquí. Es pura planificación.
