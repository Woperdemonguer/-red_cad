# RedCAD Hub — Plan de proyecto
## Intranet de la Red Estatal de Centros Agroecológicos de Distribución
### Documento técnico para el desarrollo con agente IA (Cursor/Gemini)
### Marzo 2026

---

## 1. Visión del producto

### ¿Qué es?
Una aplicación web interna (intranet) para la Red Estatal de CAD impulsada por GIASAT. Funciona como el "sistema nervioso digital" de la red: el lugar donde las agrupaciones se conocen, comparten oferta, identifican oportunidades de intercambio, acceden a recursos de intercooperación técnica, y coordinan su actividad conjunta.

### ¿Para quién?
- **Usuarios principales:** Personas que gestionan o coordinan los CAD adheridos a la red (~16 agrupaciones actualmente, con perspectiva de crecimiento). Perfiles técnicos, gerentes, coordinadoras.
- **Usuarios secundarios:** Equipo de la Secretaría Técnica de la red (CERAI + POD + GIASAT). Administran el sistema, analizan datos, preparan devoluciones.
- **Usuarios futuros potenciales:** Personas productoras socias de los CAD (acceso limitado a catálogo y disponibilidad). Potenciales clientes de la red (acceso público a un catálogo agregado).

### ¿Por qué ahora?
En el III Encuentro de la Red (Coruña, febrero 2026) se acordó:
- Enviar un formulario de diagnóstico a los CAD con plazo 15 de abril.
- Recoger los datos de producto de cada CAD para construir una base de datos colectiva.
- Hacer una devolución con análisis en mayo.
- Activar intercambios de producto entre CAD (primera velocidad).
- Diseñar el programa de intercooperación técnica basado en la autoevaluación de madurez.

La webapp es la infraestructura digital que sostiene todo esto. Sin ella, se queda en Google Forms + Excel + Drive, que es donde estamos ahora y que ya se ha identificado como insuficiente.

### ¿Qué problema resuelve?
Joel (La Diligencia) lo expresó bien en Coruña: "la capacidad técnica es muy grande y quizá solo falta cómo estructurar toda esta información, pero tener claro dónde está ubicada". Nani proponía "una web con embajadores expertos por reto". Fernando pedía "una herramienta para compartir los catálogos y generar una imagen conjunta como red". Esta webapp lo unifica todo.

---

## 2. Contexto del proyecto

### 2.1. La Red de CAD
- 16 CAD adheridos a la red estatal, distribuidos por toda España.
- Diversidad enorme: desde cooperativas con 8 personas en plantilla hasta agrupaciones gestionadas por las propias productoras.
- Tres líneas de trabajo: intercooperación económica, intercooperación técnica, gobernanza.
- Financiación principal: Fundación Daniel y Nina Carasso (proyecto DDF2026-0003, 299.600€, 24 meses).
- POD (Plant on Demand) es la cooperativa de software del consorcio GIASAT, responsable de la transformación digital.

### 2.2. Ecosistema digital existente
- **POD:** Software de gestión para CAD y productores. Muchos CAD ya lo usan. Fuente principal de datos de producto.
- **GIASAT web:** giasat.org — web pública del consorcio.
- **Toolkit GIASAT:** giasat.org/app/home — caja de herramientas para CAD (5 áreas: producción, comercialización, logística, administración, marketing).
- **Google Drive:** Repositorio actual de documentación de la red (actas, grabaciones, materiales).
- **Google Forms:** Formularios de diagnóstico (lo que hemos estado trabajando).
- **Email + WhatsApp:** Canales de comunicación actuales.

### 2.3. Decisiones ya tomadas que afectan al producto
- La información granular de producto se recoge por importación directa (POD/ERP/Excel), no por formulario.
- Se precumplimenta la ficha de cada CAD con lo que ya se sabe.
- Se usa un sistema de autoevaluación tipo semáforo (🔴🟡🟢) para clasificar madurez por ámbitos.
- La información económica sensible se trata con confidencialidad dentro de la red.
- Se trabaja en dos velocidades: intercambios inmediatos (lo que ya existe) + planificación a largo plazo.

---

## 3. Arquitectura del producto

### 3.1. Módulos principales

```
RedCAD Hub
├── 🏠 Dashboard (vista general de la red)
├── 📋 Formulario de diagnóstico (el que hemos diseñado)
├── 🏘️ Directorio de CAD (fichas de agrupaciones)
├── 📦 Base de datos de producto (catálogo colectivo)
├── 🔬 Mapa de madurez (semáforo intercoop técnica)
├── 🔄 Espacio de intercambios (oferta/demanda entre CAD)
├── 📚 Repositorio de recursos (intercoop técnica)
└── ⚙️ Panel de administración
```

### 3.2. Descripción de cada módulo

#### 🏠 Dashboard
Vista general para cada CAD al entrar. Muestra: estado de su ficha, productos activos, intercambios en curso, próximas formaciones/eventos, notificaciones de la red.

Para la Secretaría Técnica: vista agregada de toda la red. Estadísticas clave, mapa de España con los CAD, indicadores de actividad.

#### 📋 Formulario de diagnóstico
El formulario de 63 preguntas / 9 bloques que hemos diseñado, implementado como webapp interactiva. Multi-paso con guardado automático. Cada CAD lo rellena una vez y puede actualizarlo cuando quiera.

Fuentes de datos: el .md del formulario contiene toda la especificación pregunta a pregunta con tipos, opciones, comentarios opcionales y notas internas.

#### 🏘️ Directorio de CAD
Ficha pública (dentro de la red) de cada agrupación. Incluye:
- Datos básicos (nombre, territorio, forma jurídica, año, socias, equipo)
- Perfil de madurez (semáforo por ámbitos)
- Familias de producto que ofrece
- Canales de venta activos
- Capacidad logística (alcance, flota, frío, acopio)
- Persona de contacto para intercambios
- Foto del equipo/instalaciones

Las fichas se generan automáticamente a partir del formulario de diagnóstico. El CAD puede editar y enriquecer su ficha en cualquier momento.

#### 📦 Base de datos de producto
Catálogo colectivo de la oferta de toda la red. Estructura de datos:

**Tabla: Productos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| cad_id | FK → CAD | Agrupación de origen |
| nombre | string | Nombre del producto |
| categoria | enum | Huerta, Fruta, Cítricos, Frutos secos, Olivar/aceite, Viña/vino, Cereales/legumbres, Carne, Lácteos, Huevos, Apicultura, Transformados, Panadería, Bebidas |
| subcategoria | string | Ej: "tomate", "manzana", "aceite virgen extra" |
| variedad | string | Ej: "cherry", "golden", "picual" |
| calibre | string | Donde aplique |
| formato_venta | string | Ej: "caja 6kg", "caja 12kg", "granel", "unidad" |
| tipo_envase | string | Ej: "caja plástico 30x30x12", "caja cartón", "saco" |
| certificaciones | string[] | ["eco", "GlobalGAP", "Demeter", ...] |
| conservacion | enum | Ambiente, Frío, Congelado |
| vida_util_dias | int | Estimación de vida útil |
| ficha_tecnica_url | string | Enlace a ficha técnica si existe |
| origen | enum | Producción propia socias, Compra externa estable, Compra externa puntual |
| n_productores | int | Nº de productoras que disponen de este producto |

**Tabla: Precios y disponibilidad (por producto × CAD)**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| producto_id | FK | |
| precio_compra_socio | decimal | Precio de compra al socio/a |
| precio_venta_min | decimal | Precio de venta mínimo |
| precio_venta_max | decimal | Precio de venta máximo |
| precio_medio_historico | decimal | Media últimos 2-3 años |
| capacidad_actual_kg | decimal | Capacidad de producción actual (kg/campaña o kg/semana) |
| potencial_ampliacion | text | Descripción del potencial si hay demanda |
| meses_disponibles | int[] | Array de meses [1-12] en que está disponible |
| meses_pico | int[] | Meses de máxima producción |
| pedido_minimo | string | Ej: "1 palé", "50kg", "sin mínimo" |
| anticipacion_pedido | string | Ej: "48h", "1 semana" |
| updated_at | datetime | Última actualización |

**Importación de datos:**
- CAD que usan POD → exportación directa vía API o CSV desde POD (datos homogéneos).
- CAD con otro ERP → exportación CSV/Excel + procesamiento con IA para normalizar nomenclaturas.
- CAD sin sistema → Excel/listado manual + procesamiento.
- Pipeline de normalización: un script que mapea sinónimos ("tomate cherry" = "tomàquet cherry" = "cherry tomato"), estandariza formatos, y valida datos antes de insertar.

**Queries principales que debe soportar:**
- "¿Qué CAD pueden ofrecer cítricos en marzo?"
- "¿Quién tiene aceite de oliva a menos de X€/l?"
- "¿Qué productos ofrece Valle y Vega que Ekoalde necesita?"
- "¿Cuál es la oferta agregada de fruta de la red para presentar a un cliente?"
- "¿Qué productos tienen excedentes ahora mismo?"
- Vista de calendario: qué hay disponible cada mes, de qué CAD.

#### 🔬 Mapa de madurez
Visualización del semáforo de autoevaluación de todos los CAD. Permite:
- Ver a nivel de red: ¿dónde somos fuertes como red? ¿dónde hay más necesidades?
- Ver por CAD: perfil de madurez de cada agrupación.
- Matching: "necesito apoyo en logística" → ver qué CAD están en 🟢 en logística.
- Identificar embajadores/referentes por ámbito.

Ámbitos del semáforo (10):
1. Planificación productiva y coordinación de oferta
2. Gestión comercial y relación con clientes
3. Costes de producción y viabilidad económica
4. Logística y distribución
5. Calidad, trazabilidad y auditorías
6. Digitalización y herramientas de gestión
7. Gobernanza interna y gestión de equipos
8. Marketing, comunicación y visibilidad
9. Gestión administrativa, fiscal y contable
10. Acceso a restauración colectiva y compra pública

#### 🔄 Espacio de intercambios
Tablón donde los CAD pueden publicar:
- **Oferta:** "Tenemos 500kg de naranjas disponibles esta semana" (con precio, formato, condiciones).
- **Demanda:** "Buscamos proveedor de aceite de oliva ecológico para nuestros clientes" (con volumen, precio orientativo, frecuencia).
- **Propuestas de intercambio directo:** CAD A ofrece X a CAD B a cambio de Y.

Funcionalidades:
- Filtros por categoría, territorio, disponibilidad inmediata vs. planificada.
- Notificaciones cuando se publica algo que coincide con las necesidades declaradas de un CAD.
- Historial de intercambios realizados.
- A futuro: integración con POD para formalizar los pedidos entre CAD.

#### 📚 Repositorio de recursos
Organizado por los 10 ámbitos del mapa de madurez. Incluye:
- Materiales de formación (grabaciones de sesiones, presentaciones, guías).
- Documentación de la red (actas de encuentros, devoluciones, RFI, Plan Estratégico).
- Toolkit GIASAT (enlace o integración).
- Guía práctica para CAD.
- Contactos de personas referentes por ámbito.

Organización propuesta (basada en lo acordado en Coruña):
```
📚 Repositorio
├── Por ámbito temático (10 carpetas)
│   ├── Materiales de formación
│   ├── Persona(s) referente(s)
│   └── Recursos externos
├── Documentación de la red
│   ├── Actas y devoluciones de encuentros
│   ├── Documentos de gobernanza (RFI, Plan Estratégico)
│   └── Informes y memorias de proyectos
└── Herramientas (Toolkit, Guía práctica, plantillas)
```

#### ⚙️ Panel de administración
Para la Secretaría Técnica:
- Gestión de usuarios y permisos.
- Visualización agregada de respuestas del formulario.
- Exportación de datos (CSV, PDF).
- Gestión del repositorio de recursos.
- Estadísticas de uso de la plataforma.
- Herramienta de devolución: generar informes automáticos por CAD o agregados.

---

## 4. Stack tecnológico recomendado

### 4.1. Criterios de elección
- **Simplicidad:** Equipo pequeño (POD), tiene que ser mantenible.
- **Velocidad de desarrollo:** MVP en 4-6 semanas con agente IA.
- **Coste bajo:** Proyecto con financiación limitada.
- **Accesibilidad:** Usuarios con perfiles tecnológicos diversos. Tiene que funcionar bien en móvil.
- **Compatibilidad con POD:** Posibilidad de integración futura.

### 4.2. Stack propuesto

```
Frontend:  Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui
Backend:   Next.js API Routes + Prisma ORM
Base datos: PostgreSQL (Supabase o Railway)
Auth:      NextAuth.js (o Supabase Auth)
Storage:   Supabase Storage (para archivos/fotos)
Deploy:    Vercel
```

**Alternativa más ligera:**
```
Frontend:  Next.js + Tailwind
Backend:   Supabase (BaaS - Backend as a Service)
Auth:      Supabase Auth
DB:        Supabase PostgreSQL
Storage:   Supabase Storage
Deploy:    Vercel
```

La alternativa con Supabase es más rápida de montar y reduce el código de backend a escribir, porque Supabase da API REST automática sobre PostgreSQL, auth, storage y realtime out of the box.

---

## 5. Modelo de datos

### 5.1. Entidades principales

```
CAD (agrupación)
├── id, nombre, ccaa, forma_juridica, año_constitucion
├── n_socias, n_trabajadoras, perfiles_equipo
├── infraestructuras, flota, almacen_frio
├── software_gestion, alcance_distribucion
├── facturacion_rango, evolucion, resultado
├── canales_venta (JSON), concentracion_clientes
├── estacionalidad, politica_margenes
├── modelo_abastecimiento
├── capacidad_consolidar, tiempo_respuesta
├── centro_acopio (boolean + descripción)
├── foto_url, contacto_nombre, contacto_email, contacto_tel
├── created_at, updated_at
│
├── MaturityScore[] (1 por ámbito × CAD)
│   ├── ambito (enum 10 valores)
│   ├── nivel (rojo/amarillo/verde)
│   ├── puede_compartir (boolean)
│   ├── necesita_apoyo (boolean)
│   └── persona_referente (string, opcional)
│
├── Producto[] (catálogo del CAD)
│   ├── (ver esquema detallado en sección 3.2)
│   └── PrecioDisponibilidad[]
│
├── Intercambio[] (ofertas/demandas publicadas)
│   ├── tipo (oferta/demanda)
│   ├── producto, cantidad, precio, condiciones
│   ├── estado (activo/cerrado)
│   └── cad_contraparte (si se cierra)
│
└── FormularioRespuesta (JSON con todas las respuestas)
    └── bloque_0..bloque_8
```

### 5.2. Relaciones clave
- Un CAD tiene muchos Productos.
- Un CAD tiene 10 MaturityScores (uno por ámbito).
- Un CAD tiene muchos Intercambios (como oferente o demandante).
- Un CAD tiene una FormularioRespuesta.
- Los Productos pueden cruzarse entre CAD para detectar complementariedades.

---

## 6. Fases de desarrollo

### Fase 1: MVP (4-6 semanas) — "Lo esencial para abril"
**Objetivo:** Tener el formulario online y la recogida de datos funcionando antes del 15 de abril.

Incluye:
- [ ] Auth básica (login por email/invitación para cada CAD)
- [ ] Formulario de diagnóstico completo (63 preguntas, 9 bloques, guardado automático)
- [ ] Ficha pre-cumplimentada editable por cada CAD
- [ ] Dashboard mínimo (estado del formulario, datos básicos)
- [ ] Panel admin: ver respuestas, exportar CSV

No incluye (todavía): catálogo de producto, intercambios, repositorio.

### Fase 2: Catálogo y fichas (semanas 7-10) — "Conocernos"
**Objetivo:** Tener la base de datos de producto y las fichas de CAD listas para la devolución de mayo.

Incluye:
- [ ] Pipeline de importación de datos de producto (POD + CSV + manual)
- [ ] Normalización de nomenclaturas (script + validación humana)
- [ ] Catálogo consultable con filtros (categoría, territorio, mes, CAD)
- [ ] Fichas de CAD generadas desde el formulario + editables
- [ ] Mapa de madurez (semáforo) con vista de red y vista por CAD
- [ ] Directorio de CAD con búsqueda

### Fase 3: Intercambios y recursos (semanas 11-16) — "Cooperar"
**Objetivo:** Activar los intercambios de producto y el repositorio técnico.

Incluye:
- [ ] Tablón de ofertas/demandas entre CAD
- [ ] Notificaciones de matching (oferta ↔ necesidad)
- [ ] Repositorio de recursos organizado por ámbitos
- [ ] Calendario de disponibilidad de producto (vista mensual)
- [ ] Historial de intercambios

### Fase 4: Refinamiento y escalado (semanas 17+) — "Consolidar"
- [ ] Integración con POD para formalizar pedidos entre CAD
- [ ] Catálogo público agregado (para presentar la oferta de la red a clientes)
- [ ] Estadísticas y reporting avanzado
- [ ] App móvil o PWA optimizada
- [ ] Onboarding para nuevos CAD que se adhieran a la red

---

## 7. Diseño y UX

### 7.1. Principios
- **Calidez:** No es un ERP, es la casa digital de una red de personas. Tono cercano, visual orgánico.
- **Simplicidad:** Usuarios con perfiles tecnológicos diversos. Nada de dashboards complejos.
- **Accesibilidad móvil:** Muchas personas responderán desde el móvil.
- **Bilingüe:** Interfaz en español, pero preparada para catalán/euskera/gallego si se necesita.

### 7.2. Identidad visual
Dos líneas de diseño disponibles (ya prototipadas):

**Línea RedCAD (verde/bosque):** Tonos forest (#2E5339), sage (#8BAA7C), cream (#FAFAF5), sand (#F0EDE4). Cálida, orgánica, evoca lo agrícola. Para las interfaces internas de la red.

**Línea GIASAT (dorado/blanco):** Tonos gold (#EBA615), white (#FAFAFA), blue-gray (#2D3748/#64748B). Limpia, profesional, editorial. Para las interfaces orientadas a comunicación externa o institucional.

Ambas están prototipadas como componentes React funcionales en el repositorio (ver `/Product/Frontend/`).

### 7.3. Componentes del formulario ya construidos
En `/Product/Frontend/` hay dos implementaciones completas del formulario (63 preguntas, 9 bloques) como componentes React:
- `FormularioRedCAD.jsx` — versión verde/bosque
- `FormularioGIASAT_v2.jsx` — versión dorada/blanca

Ambos incluyen: navegación multi-paso, barra de progreso, pills de bloque, radio/checkbox/textarea con "Otro" y comentario opcional, campos info para matrices, pantalla de completado.

---

## 8. Datos y contenido disponible

### 8.1. Lo que ya existe y se puede usar

**Para el formulario:**
- `Formulario_RedCAD_Propuesta_Reestructuracion_v1.md` — Especificación completa de las 63 preguntas con tipos, opciones, comentarios, y notas internas. **Este es el documento maestro.**

**Para las fichas de CAD (datos pre-cumplimentados):**
- Los 16 CAD adheridos están identificados: La Diligencia, Valle y Vega, Ecojerte, Tierra y Libertad, Cooperativa Agroecológica de Montaña, Biocanarias, UHAM, Hortacuina, Saltamontes Bio, APAEMA, Pagesos Ecològics de Mallorca, Ekoalde, Vallaecolid, Ecoagra, Terra Pagesa, y uno en proceso.
- Información parcial disponible en las devoluciones de los encuentros y en los informes de seguimiento.

**Para el catálogo de producto:**
- Los CAD que usan POD tienen datos exportables directamente.
- Se pedirá a cada CAD una exportación de su catálogo (ver Anexo del formulario).

**Para el repositorio:**
- Google Drive existente con actas, grabaciones, materiales de formación.
- Toolkit GIASAT (giasat.org/app/home).
- Guía práctica para CAD.

**Para el mapa de madurez:**
- Se generará a partir de la pregunta 4.1 del formulario (matriz semáforo).

### 8.2. Documentación de contexto disponible en `/Context/`
Todo el corpus documental del proyecto está organizado en:
- `Encuentros presenciales/` — Devoluciones y actas de Valencia, Granada, Coruña
- `Memorias proyectos/` — Propuestas e informes Carasso, MAPAMA
- `Resultados proyectos/` — Informes de seguimiento y resultados
- `Otros documentos/` — Guía práctica, toolkit, etc.

Esta documentación es la fuente de verdad para entender el tono, las decisiones, las voces y las prioridades de la red.

---

## 9. Instrucciones para el agente IA de desarrollo

### 9.1. Contexto que debes tener claro
- Estás construyendo una intranet para una red de cooperativas y agrupaciones agroecológicas. No es un SaaS genérico, es una herramienta de una comunidad real de personas.
- El tono es cercano, impersonal reflexivo (se propone, se invita, resulta importante), nunca de auditoría ni de consultoría.
- La diversidad de madurez técnica de los usuarios es enorme: desde equipos profesionalizados hasta personas productoras con uso básico del móvil.
- La confianza es el factor crítico de la red. Todo lo que se diseñe debe transmitir seguridad, confidencialidad y respeto.

### 9.2. Archivos clave que debes leer antes de empezar
1. **`/Blueprint/Formulario_RedCAD_contenido.md`** — Especificación completa del formulario. Es la fuente de verdad para las preguntas, opciones, tipos y estructura.
2. **`/Blueprint/Informe_Cambios_RedCAD.md`** — Explica por qué se ha diseñado así, qué decisiones se han tomado y qué viene de dónde.
3. **`/Product/Frontend/FormularioRedCAD.jsx`** y **`FormularioGIASAT_v2.jsx`** — Prototipos funcionales del formulario ya implementados en React. Puedes reutilizar la estructura de datos, los componentes y la lógica.
4. **`/Context/`** — Lee al menos las actas del III Encuentro de Coruña para entender las voces, las prioridades y el tono.

### 9.3. Prioridades de desarrollo
1. Que funcione el formulario online antes del 15 de abril.
2. Que sea bonito, cálido y fácil de usar en móvil.
3. Que guarde las respuestas de forma segura y exportable.
4. Todo lo demás viene después.

---

## 10. Estructura del repositorio

```
redcad-hub/
├── README.md
├── Blueprint/                    # Especificaciones y documentación del producto
│   ├── Formulario_RedCAD_contenido.md
│   ├── Formulario_RedCAD_branding_Giasat.jsx
│   ├── Formulario_RedCAD_branding_sin.jsx
│   └── Informe_Cambios_RedCAD.md
├── Context/                      # Documentación de contexto del proyecto
│   ├── Encuentros presenciales/
│   ├── Memorias proyectos/
│   ├── Resultados proyectos/
│   └── Otros documentos/
├── Product/                      # Código del producto
│   ├── Frontend/
│   └── Backend/
└── .cursorrules (o .gemini)      # Instrucciones para el agente IA
```

---

## 11. Métricas de éxito

### Fase 1 (abril 2026)
- 100% de los CAD adheridos han recibido y pueden acceder al formulario.
- Al menos 12 de 16 CAD han completado el formulario.
- Los datos se pueden exportar y analizar.

### Fase 2 (mayo-junio 2026)
- Base de datos de producto con al menos 10 CAD cargados.
- Fichas de CAD visibles para toda la red.
- Mapa de madurez generado y compartido.

### Fase 3 (septiembre 2026)
- Al menos 3 intercambios de producto formalizados a través de la plataforma.
- Repositorio de recursos activo con materiales de al menos 5 ámbitos.
- Uso regular de la plataforma por parte de al menos 10 CAD.

---

*Documento elaborado por Alejandro Wonenburger (POD/GIASAT) con apoyo de Claude (Anthropic). Marzo 2026.*
*Basado en el trabajo colectivo del consorcio GIASAT y la Red Estatal de CAD.*
