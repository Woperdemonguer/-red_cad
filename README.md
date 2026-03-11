# 🌱 RedCAD Hub — El Sistema Nervioso Digital de la Red Estatal de CAD

Este directorio (`Red de cad`) contiene absolutamente **todos los archivos** necesarios para el desarrollo, planificación y ejecución de la Intranet de la Red Estatal de Centros Agroecológicos de Distribución (impulsada por GIASAT, POD y Fundación Daniel y Nina Carasso).

Esta no es una intranet convencional; es la infraestructura digital centralizada diseñada para escalar la cooperación territorial, económica y técnica entre las agrupaciones agroecológicas de toda España.

---

## 🚀 La Gran Visión del Producto

La hoja de ruta arquitectónica de esta Web App comprende los siguientes **5 MACRO-MÓDULOS**:

1. 📊 **Módulo de Diagnóstico**: Formulario interactivo multi-paso para medir el "Termómetro de la Red" y la madurez organizativa en 10 ámbitos.
2. 🏘️ **Módulo de Perfiles de la red**: Directorio interactivo para visualizar profundamente a cada cooperativa hermana, auto-generado con sus datos estructurales.
3. 📦 **Módulo de Productos de la red**: Un motor que normaliza diversos excels de producto en un único catálogo filtrable (La Mega-Tabla).
4. 📚 **Repositorio de Intercooperación Técnica**: Biblioteca viva estructurada (Vídeos, formaciones, actas) según los 10 ámbitos de madurez.
5. 🛠️ **Herramientas Operativas**: Calculadoras integradas para costes, márgenes y optimización logística.

---

## 🗺️ El Mapa de la "Oficina Virtual" (Tu Guía de Navegación)

El proyecto está estructurado en 3 pilares lógicos numerados. **Si no eres un perfil técnico, este es tu mapa para entenderlo todo.**

### 📚 Pilar 1: `/1_Context` (Tu Biblioteca)
Aquí vive toda la historia y la documentación oficial de la Red de CAD. El equipo técnico no toca estos archivos, los **lee** para entender cómo piensa y habla la Red.
- 📁 **`Bases_de_Datos_Originales/`**: Los archivos Excel `.xlsx` exportados por cada cooperativa con sus catálogos en crudo.
- 📁 **`Encuentros_Presenciales/`**: Las actas y transcripciones de Coruña, Valencia y Granada.
- 📁 **`Memorias_Proyectos/`**: Propuestas a Fundación Carasso y MAPAMA.
- 📁 **`Otros_Documentos/`**: Formularios PDF antiguos, guías prácticas, el contexto de "De dónde venimos".
- 📁 **`Resultados_Proyectos/`**: Memorias e informes de seguimiento (2020-2025).

### 📐 Pilar 2: `/2_Blueprint` (Tu Sala de Planificación Arquitectónica)
Antes de escribir código, escribimos las reglas de negocio aquí. **Lee estos documentos para entender cómo funciona la plataforma por dentro.**

**Visión y Metodología:**
- 📄 `01_Intranet_Project_Plan.md`: El documento maestro. Léelo para entender el "Gran Por Qué", los objetivos y los módulos.
- 📄 `02_Architecture_and_Methodology.md`: Explica las normas de construcción de la App. *[Incluye Resumen para No Técnicos]*.

**Roles y Datos Externos:**
- 📄 `03_Module_2_POD_Integration_Blueprint.md`: La lógica "Traductora" para subir un Excel de productos. *[Incluye Resumen para No Técnicos]*.
- 📄 `04_Pilot_Project_and_RBAC.md`: Cómo controlamos las "Llaves virtuales" y los permisos de Administrador. *[Incluye Resumen para No Técnicos]*.

**El Formulario de Diagnóstico (El Corazón de los Datos):**
- 📄 `05_Form_Methodology.md`: Por qué preguntamos lo que preguntamos y cómo adaptamos el "tono" de las preguntas.
- 📄 `06_Form_Content.md`: Las 63 preguntas exactas del formulario divididas en sus 9 bloques.
- 📄 `10_Form_v1.0_Giasat_Brand.jsx` & `11_Form_v1.0_POD_Brand.jsx`: Código antiguo del formulario para reciclaje visual.

**La Base de Datos (Estructuras):**
- 📄 `07_DB_Interconnections_and_Profiles.md`: La diferencia entre el "Formulario Privado" y el "Perfil Público" de un CAD.
- 📄 `08_Global_Product_DB_Schema.md` & `09_Extended_CAD_Profile_Schema.md`: Tablas puramente técnicas de la base de datos (PostgreSQL).

*(Nota: En `/Documentos_IA` se guardan los planes y resúmenes auto-generados por el equipo durante el trabajo).*

### 🏭 Pilar 3: `/3_Product` (Tu Fábrica de Código)
Este es el producto real que tocarán las cooperativas.
- 📁 **`/Modulo_1_Formulario_Legacy`**: Código del formulario original antiguo.
- 📁 **`/frontend`**: **LA WEBAPP PRINCIPAL.** Todo el desarrollo en React/Next.js de la Intranet ocurre dentro de la carpeta `app/`. ¡Aquí está la magia!

---

## 💻 ¿Cómo arrancar la Intranet en tu ordenador?

Si quieres levantar el restaurante y ver cómo luce la interfaz:

1. Abre tu **Terminal** o línea de comandos.
2. Navega al espacio donde viven los motores del producto pegando este comando: 
   `cd "Red de cad/3_Product/frontend"`
3. Enciende el motor: 
   `npm run dev`
4. Abre tu navegador de internet (Chrome, Safari, etc.) y visita: 
   👉 **[http://localhost:3000](http://localhost:3000)**
