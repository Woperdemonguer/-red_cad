# 📁 `.agent/` — The AI Development Framework

> **Para el equipo humano:** Esta carpeta es el "cerebro permanente" de la IA. Contiene la filosofía, las reglas, la memoria, y los estándares técnicos que la IA lee antes de tocar cualquier línea de código. Sin estos archivos, cada sesión empieza desde cero.
>
> **The universal files** (`core/`) work on ANY project. Copy them to a new project and the AI knows how to work. The project-specific files (`project/`) are rebuilt for each codebase.

---

## Estructura

```
.agent/
├── README.md                         ← Este archivo
│
├── workflows/
│   └── master-protocol.md            ← 🚪 Punto de entrada (el sistema lo lee automáticamente)
│
├── core/                             ← 🌍 UNIVERSAL (copiable a cualquier proyecto)
│   ├── methodology_manifesto.md      ← La Filosofía (10 mandamientos + pirámide + anti-patrones) 
│   ├── quality_gates.md              ← Definición de "hecho" (pirámide de 6 niveles)
│   ├── communication_contract.md     ← Cómo la IA habla con el PM (regla IKEA, autonomía)
│   ├── onboarding.md                 ← Checklist del primer día (7 pasos + protocolo de cierre)
│   └── lessons_learned.md            ← Memoria de errores (crece con el proyecto)
│
├── project/                          ← 🏗️ ESPECÍFICO DEL PROYECTO (se reconstruye por proyecto)
│   ├── engineering_standards.md      ← Stack técnico, arquitectura, convenciones
│   ├── ux_patterns.md                ← Componentes, patrones de error, estado, responsive
│   └── database_dictionary.md        ← Tablas, columnas, variables de entorno, gotchas
│
└── templates/                        ← 📋 PLANTILLAS (para nuevos proyectos)
    └── new_project_setup.md          ← Guía paso a paso para configurar .agent/ desde cero
```

---

## ¿Qué hay en cada archivo?

### 🌍 Capa Universal (Portátil)

| Archivo | Propósito | Analogía |
|---------|-----------|----------|
| `master-protocol.md` | Reglas de comportamiento, loop de trabajo, anti-patrones, checklist | El "Manual del Empleado" |
| `methodology_manifesto.md` | Filosofía: 10 mandamientos, jerarquía de necesidades, cuándo romper reglas | La "Constitución" |
| `quality_gates.md` | Definición de "hecho" en 6 niveles (línea → función → componente → feature → release → delight) | La "Inspección de Edificación" |
| `communication_contract.md` | Cómo habla la IA: espectro de autonomía, regla IKEA, protocolo de malas noticias | El "Manual de Comunicación" |
| `onboarding.md` | Los primeros 5 minutos de cada sesión + protocolo de cierre | La "Orientación del Primer Día" |
| `lessons_learned.md` | Directivas permanentes nacidas de errores reales | El "Cuaderno de Errores" |

### 🏗️ Capa del Proyecto (Específica)

| Archivo | Propósito | Analogía |
|---------|-----------|----------|
| `engineering_standards.md` | Stack, colores, arquitectura, base de datos, testing, herramientas | El "Código de Edificación" |
| `ux_patterns.md` | Librería de componentes, manejo de errores, estado, responsive | El "Catálogo de Piezas" |
| `database_dictionary.md` | Cada tabla, cada columna, cada variable de entorno | El "Diccionario de Datos" |

### 📋 Plantillas

| Archivo | Propósito | Analogía |
|---------|-----------|----------|
| `new_project_setup.md` | Guía para configurar `.agent/` en un proyecto nuevo | El "Manual de Franquicia" |

---

## ¿Cómo funciona?

```text
Nueva Sesión
    │
    ├── 1. Lee master-protocol.md (reglas)
    ├── 2. Lee methodology_manifesto.md (filosofía)
    ├── 3. Lee lessons_learned.md (errores pasados)
    ├── 4. Lee quality_gates.md + communication_contract.md (estándares)
    ├── 5. Lee la arquitectura del proyecto
    ├── 6. Verifica: tests ✅, build ✅
    └── 7. Anuncia: "Listo para trabajar"

Trabajando en código → Lee project/engineering_standards.md
Construyendo UI → Lee project/ux_patterns.md
Tocando la base de datos → Lee project/database_dictionary.md
Algo salió mal → Documenta en lessons_learned.md
PM corrige la IA → Actualiza lessons_learned.md INMEDIATAMENTE
```

---

## ¿Quieres usar esto en OTRO proyecto?

Sigue la guía en `templates/new_project_setup.md`. En 30 minutos tendrás el mismo sistema de calidad funcionando en cualquier proyecto nuevo.
