# 📚 1_Context — La Biblioteca de Referencia

> **¿Qué es esta carpeta?**
> Aquí viven los **documentos originales** del proyecto de la Red de CAD. Es la "biblioteca" del proyecto: actas de encuentros, memorias de proyectos, formularios originales en PDF, y los archivos Excel brutos con los catálogos de las cooperativas.
>
> **Regla fundamental:** Estos archivos **NO se editan durante el desarrollo.** Solo se leen para entender el contexto, el tono y las necesidades de la red. El código nunca modifica estos archivos.

---

## 📁 Estructura de carpetas

### `Bases_de_Datos_Originales/`
**Qué es:** Los archivos Excel exportados directamente desde los sistemas de gestión de cada cooperativa (POD, ERPs propios, hojas de cálculo).

**Qué contiene:**
| Archivo | Cooperativa | Uso en el proyecto |
|---------|-------------|-------------------|
| `Productos_Tierra y Libertad.xlsx` | CAD Tierra y Libertad | Fuente de datos para testear el POD Parser (Module 2) |
| `Productos_UHAM.xlsx` | CAD UHAM | Fuente de datos para testear el POD Parser |

**Para qué sirve:** Estos archivos se usan como "muestras de laboratorio" para desarrollar y testear el módulo de importación de productos (`03_Products_module_blueprint.md`). El Parser debe ser capaz de leer cualquiera de estos archivos y normalizar sus columnas al esquema unificado de la plataforma.

---

### `Encuentros_Presenciales/`
**Qué es:** La documentación oficial de los 3 encuentros presenciales de la red.

**Qué contiene:**
| Encuentro | Ciudad | Archivos |
|-----------|--------|----------|
| I Encuentro | Granada | `Devolucion_I_Encuentro_Granada_General.docx` |
| II Encuentro | Valencia | 4 archivos: Devolución General, Gobernanza, Intercoop Económica, Intercoop Técnica |
| III Encuentro | Coruña | 4 archivos: Programa, Actas Intercoop Económica, Actas Intercoop Técnica, Transcripción Talleres |

**Para qué sirve:** Estos documentos contienen las voces reales de los coordinadores de CAD. Las citas textuales de Joel, Nani y Fernando que aparecen en las Blueprints provienen de estas transcripciones. Son la fuente de verdad para el "tono" de la plataforma.

---

### `Memorias_Proyectos/`
**Qué es:** Las propuestas de financiación presentadas a la Fundación Daniel y Nina Carasso y al MAPAMA.

**Qué contiene:**
| Archivo | Periodo | Financiador |
|---------|---------|-------------|
| `Propuesta_Proyecto_Carasso_20_21.pdf` | 2020-2021 | Fundación Carasso |
| `Propuesta_Proyecto_Carasso_22_23.pdf` | 2022-2023 | Fundación Carasso |
| `Propuesta_Proyecto_Carasso_24_25.pdf` | 2024-2025 | Fundación Carasso |
| `Propuesta_Proyecto_Carasso_26_27.pdf` | 2026-2027 | Fundación Carasso (actual) |
| `Propuesta_Proyecto_MAPAMA_22_24.pdf` | 2022-2024 | MAPAMA |

**Para qué sirve:** Contexto estratégico. Estos documentos explican los objetivos formales del proyecto y los indicadores de impacto comprometidos con los financiadores.

---

### `Otros_Documentos/`
**Qué es:** Documentos complementarios de referencia.

**Qué contiene:**
| Archivo | Descripción |
|---------|-------------|
| `Contexto_Guia_Practica_para_CAD.pdf` | Guía práctica para la creación y gestión de un CAD |
| `Contexto_III_Encuentro_Coruna_De_Donde_Venimos.pdf` | Presentación histórica de la red |
| `Contexto_III_Encuentro_Coruna_Que_Haremos.pdf` | Hoja de ruta presentada en Coruña |
| `Formulario_Diagnostico_CAD.pdf` | El formulario original en PDF (antes de digitalizarlo) |
| `Formulario_Diagnostico_Socios_CAD.pdf` | Versión del formulario para socios individuales |
| `Informe_Cambios_Formulario_RedCAD.pdf` | Documento de cambios aplicados al formulario |

**Para qué sirve:** El `Formulario_Diagnostico_CAD.pdf` es la **referencia canónica** de las 63 preguntas. Cuando hay dudas sobre el contenido del formulario digital, se consulta este PDF.

---

### `Resultados_Proyectos/`
**Qué es:** Memorias de resultados y seguimiento presentadas a los financiadores.

| Archivo | Periodo |
|---------|---------|
| `Memoria_Resultados_Carasso_20_21_1.docx` | Primer informe 2020-2021 |
| `Memoria_Resultados_Carasso_20_21_2.docx` | Segundo informe 2020-2021 |
| `Memoria_Resultados_Carasso_22_23.pdf` | Informe 2022-2023 |
| `Memoria_Resultados_Carasso_24_25.pdf` | Informe 2024-2025 |

**Para qué sirve:** Contexto de impacto. Estos documentos muestran qué se ha logrado en fases anteriores y sirven como base para los indicadores de resultado de la plataforma digital.
