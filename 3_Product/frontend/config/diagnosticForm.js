export const MADUREZ_TOOLTIPS = {
  "Planificación productiva y coordinación de oferta entre socias": "Capacidad para coordinar los cultivos de la base social con antelación, basándose en la demanda esperada.",
  "Gestión comercial y relación con clientes": "Capacidad para buscar proactivamente nuevos clientes, fijar precios rentables y mantener relación fluida con canales de venta.",
  "Costes de producción y viabilidad económica": "Capacidad de calcular y hacer seguimiento real de cuánto cuesta producir y distribuir cada producto.",
  "Logística y distribución": "Eficiencia en recogida, almacenamiento, preparación de pedidos y distribución física.",
  "Calidad, trazabilidad y gestión de auditorías": "Estandarización de calibres, maduración, presentación, protocolos de revisión y gestión de mermas.",
  "Digitalización y uso de herramientas de gestión": "Uso sistemático de herramientas digitales (ERP, POD, etc.) para gestión integral y trazabilidad.",
  "Gobernanza interna y gestión de equipos": "Claridad en procesos de toma de decisiones, roles asignados y nivel de participación democrática.",
  "Marketing, comunicación y visibilidad": "Generación de identidad clara, materiales comerciales y presencia para poner en valor el proyecto.",
  "Gestión administrativa, fiscal y contable": "Solidez y orden en contabilidad, fiscalidad, facturación, cobros/pagos y trámites.",
  "Acceso a restauración colectiva y compra pública": "Experiencia y capacidad para servir a comedores públicos/privados de forma constante.",
  "Sistemas de indicadores, medición y evaluación": "Capacidad para medir, evaluar y hacer seguimiento de la actividad del CAD con indicadores."
};

export const blocks = [
  // ─── INTRO ───
  {
    id: "intro",
    title: "Presentación",
    icon: "📜",
    type: "intro",
    intro: "Red Estatal de CAD — GIASAT · Formulario de diagnóstico de la red · Marzo 2026",
    content: {
      paragraphs: [
        "Este formulario tiene como objetivo conocer mejor la realidad actual de cada CAD de la red y recoger información útil para orientar el trabajo colectivo en los próximos 12 meses, como mínimo.",
        "Es uno de los primeros y más importantes pasos que acordamos tras el III Encuentro de la Red en A Coruña. Somos conscientes de que es una tarea exigente con el día a día que lleva cada CAD. Por eso lo hemos preparado en esta plataforma, para que se pueda completar poco a poco y se puedan consultar con los equipos técnicos o con la base social algunas cuestiones si es necesario.",
        "Como veréis, hemos creado ya un primer espacio de Intranet para la Red de CAD: una herramienta que iremos estructurando, mejorando y alimentando de vuestra mano. El Bloque 0 (Mi perfil) servirá para construir la ficha de cada CAD dentro de la Intranet, que todos los CAD podréis consultar de forma visual y rápida."
      ],
      sections: [
        {
          title: "¿Qué se busca con este formulario?",
          items: [
            "La situación organizativa, económica y operativa de cada CAD.",
            "Su capacidad actual y futura para participar en intercambios con otros CAD.",
            "Sus intereses y necesidades en materia de intercooperación técnica.",
            "Las prioridades que debería abordar la red en el corto y medio plazo."
          ]
        },
        {
          title: "¿Cómo se utilizará esta información?",
          items: [
            "Ordenar mejor el trabajo de la red.",
            "Identificar necesidades y acciones prioritarias.",
            "Detectar posibles complementariedades entre agrupaciones.",
            "Diseñar de forma más realista futuros intercambios, apoyos técnicos, proyectos y herramientas compartidas."
          ]
        },
        {
          title: "Algunas indicaciones prácticas",
          items: [
            "La mayor parte de las preguntas son de respuesta rápida.",
            "Cuando no se disponga del dato exacto, se puede responder de forma aproximada.",
            "Toda la información se utilizará únicamente para fines internos de la red."
          ]
        }
      ],
      contact: {
        email: "giasatagroecologico@gmail.com",
        people: [
          { name: "Alejandro", role: "Cuestiones técnicas", phone: "744 48 72 71" },
          { name: "Pedro", role: "Cuestiones de contenido", phone: "620 87 24 68" }
        ]
      }
    },
    questions: []
  },

  // ─── BLOQUE 1: GOBERNANZA Y ORGANIZACIÓN INTERNA ───
  // NOTE: Bloque 0 ("Mi perfil") has been moved to the /profile page.
  // The form now starts with the diagnostic questionnaire directly.
  {
    id: 1,
    title: "Gobernanza y organización interna",
    icon: "🤝",
    intro: "Resulta importante entender cómo se organiza y toma decisiones cada agrupación. Cada CAD tiene su forma de funcionar, y eso condiciona cómo se puede cooperar entre todos y todas.",
    questions: [
      { id: "section_1_1", type: "section", title: "Toma de decisiones y planificación" },
      { id: "1.1", q: "¿Cómo se toman las decisiones comerciales en el CAD?", type: "radio", tooltip: "Por ejemplo: abrir un nuevo canal de venta, aceptar un cliente grande, fijar precios de campaña.", options: ["El equipo técnico/gerencia tiene autonomía para las decisiones comerciales del día a día, una vez acordadas las líneas estratégicas en Junta o Asamblea", "Las decisiones comerciales relevantes pasan por una comisión o grupo de trabajo creado ad hoc dentro del CAD", "Las decisiones comerciales importantes requieren aprobación de la junta/asamblea", "No hay un proceso definido, se va decidiendo sobre la marcha, siempre que entre dentro de los objetivos del CAD hay margen de experimentar y probar"], hasOther: true, hasComment: true },
      { id: "1.1a", q: "¿El CAD dispone de algún documento de planificación estratégica o plan de acción?", type: "radio", tooltip: "Documentos que definan objetivos, prioridades o líneas de trabajo para un periodo determinado.", options: ["Sí, existe un Plan Estratégico formalizado", "Sí, existe un Plan de Acción o documento equivalente con prioridades de trabajo", "Se han definido objetivos o prioridades pero no están recogidos en un documento formal", "No existe un documento de planificación estratégica o equivalente"], hasOther: true, hasComment: true },
      { id: "1.1b", q: "Si existe planificación estratégica, ¿se ha elaborado también un plan de viabilidad asociado?", type: "radio", options: ["Sí, existe un plan de viabilidad asociado", "Sí, parcialmente o de forma orientativa", "No existe un plan de viabilidad asociado", "No aplica"], hasOther: true, hasComment: true },

      { id: "section_1_2", type: "section", title: "Coordinación comercial y liderazgo" },
      { id: "1.2", q: "¿Quién coordina actualmente la oferta y la relación con clientes?", type: "radio", tooltip: "Quién decide qué se vende, a quién y en qué condiciones.", options: ["Equipo técnico / personal contratado con dedicación a ello", "Una comisión comercial de personas socias", "La junta directiva o coordinación general, entre otras tareas", "Liderazgos informales de socios/as que asumen ese papel", "No hay nadie con esa función clara"], hasOther: true, hasComment: true },
      { id: "1.2a", q: "Si se ha indicado equipo técnico, ¿qué personas se encargan principalmente?", type: "checkbox", options: ["Persona responsable de acción comercial", "Persona directora / coordinadora / gerencia", "Trabajo conjunto entre responsable comercial y dirección"] },
      { id: "1.3", q: "¿Se ha abordado internamente el tema de trabajar comercialmente con otros CAD de la red?", type: "radio", tooltip: "Puede haberse tratado en asamblea, en junta, o en conversaciones informales.", options: ["Sí, y hay respaldo claro para avanzar", "Sí, pero hay dudas o falta de pedagogía interna", "No, todavía no se ha planteado", "No aplica, la decisión la toma el equipo técnico directamente"], hasComment: true },
      { id: "1.4", q: "Si hay dudas o debates internos respecto a la intercooperación económica, descríbelos brevemente.", type: "textarea", optional: true, tooltip: "La intercooperación económica no es solo intercambiar productos. Si intuyes dudas en tu base social, descríbelos brevemente." },

      { id: "section_1_3", type: "section", title: "Relación equipo técnico — base social" },
      { id: "1.5", q: "¿Cómo es la relación entre el equipo técnico y la base social productora? ¿Cuáles son los principales mecanismos de coordinación?", type: "textarea", tooltip: "Por ejemplo: reuniones periódicas, grupos de WhatsApp, asambleas, visitas a fincas, etc." },

      { id: "section_1_4", type: "section", title: "Precios, condiciones y seguimiento" },
      { id: "1.6", q: "¿Hay acuerdos internos sobre precios y condiciones comerciales comunes?", type: "radio", tooltip: "Si existe algún criterio compartido para fijar precios de compra a socias, márgenes, o condiciones de venta.", options: ["Sí, hay criterios comunes (listas de precios, márgenes, revisión periódica)", "Parcial (solo algunos productos o campañas)", "No, cada socio/a fija sus propias condiciones", "No aplica"], hasOther: true, hasComment: true },
      { id: "1.6a", q: "Si hay acuerdos de precios, ¿cómo se fijan?", type: "textarea", optional: true, tooltip: "Interesa saber si se parte del coste de producción, si hay fichas técnicas de costes, si se negocia con cada socia, etc." },
      { id: "1.6b", q: "¿Cuáles son los factores que determinan el precio de compra a las personas socias?", type: "radio", options: ["Hay una fundamentación técnica de partida compartida con las personas socias, y a partir de ahí se decide y valida colectivamente", "Hay una fundamentación técnica de partida y está acordado que las personas socias que quieran vender deben aceptar los precios indicados", "No hay una fundamentación técnica precisa; son las personas productoras quienes definen los precios que el equipo gestor acepta"], hasOther: true, hasComment: true },
      { id: "1.6c", q: "¿El CAD dispone de mecanismos de seguimiento y evaluación de su actividad más allá de la presentación anual de cuentas?", type: "checkbox", options: ["Informe de gestión anual", "Cuadro de mando con indicadores económicos básicos", "Sistema de indicadores de gestión más allá de las cuestiones económicas", "Informes económicos periódicos (semanales, mensuales o trimestrales)", "Seguimiento periódico de objetivos o del plan estratégico", "No existen herramientas de seguimiento estructuradas"], hasOther: true, hasComment: true },

      { id: "section_1_5", type: "section", title: "Liderazgo" },
      { id: "1.7", q: "¿Quién ejerce el liderazgo en las iniciativas colectivas del CAD? ¿Son personas productoras o el equipo técnico?", type: "textarea", tooltip: "Queremos identificar si existen dentro del colectivo personas con liderazgo o iniciativa.", hasComment: true },
    ],
  },

  // ─── BLOQUE 2: MODELO DE NEGOCIO Y DIMENSIÓN ECONÓMICA ───
  {
    id: 2,
    title: "Modelo de negocio y dimensión económica",
    icon: "📊",
    intro: "Para poder plantear intercambios reales y acciones conjuntas, como red es importante tener una imagen clara de dónde está cada agrupación en términos económicos. Toda esta información se trata con confidencialidad.",
    questions: [
      { id: "section_2_1", type: "section", title: "Facturación y evolución" },
      { id: "2.1", q: "Volumen aproximado de facturación anual del CAD (ejercicio 2025).", type: "radio", tooltip: "Es para situar la dimensión de la agrupación. Mucho no tiene por qué ser mejor.", options: ["Menos de 50.000 €", "50.000 – 150.000 €", "150.000 – 300.000 €", "300.000 – 600.000 €", "600.000 – 1.000.000 €", "1.000.000 – 1.500.000 €", "Más de 1.500.000 €"], hasComment: true },
      { id: "2.2", q: "¿Cómo ha evolucionado la facturación en los últimos 3 años?", type: "radio", tooltip: "Una tendencia aproximada es suficiente.", options: ["Fase de crecimiento muy rápido (20 % o más)", "Fase de expansión (más del 10 % anual)", "Crecimiento sostenido (entre un 4 y un 9 % anual)", "Estable (entre el 1 y el 3 %)", "Irregular (altibajos significativos en los últimos tres años)", "Evolución descendente en los últimos tres años", "Situación crítica, con descensos de facturación anual por encima del 10 %", "Acabamos de empezar, no hay histórico suficiente"], hasOther: true },

      { id: "section_2_2", type: "section", title: "Resultado económico" },
      { id: "2.2a", q: "En relación al último ejercicio (2025), ¿cuál ha sido el resultado económico del CAD?", type: "radio", options: ["Sí, resultado positivo", "Equilibrio (sin pérdidas pero sin margen significativo)", "Resultado negativo pero dentro de lo previsto", "Resultado negativo y situación complicada", "No se dispone de cierre definitivo", "Se prefiere no compartir esta información de momento"], hasOther: true, hasComment: true },
      { id: "2.2b", q: "¿El CAD ha generado resultado positivo en alguno de los tres últimos años?", type: "radio", tooltip: "Hay agrupaciones incipientes, otras en equilibrio, otras en situaciones complicadas. Conocerlo permite que la red ofrezca apoyo.", options: ["Sí, resultado positivo en alguno de los tres años", "Equilibrio si tomamos los tres años como referencia", "Resultado negativo pero dentro de lo previsto (agrupación reciente o en fase de inversión)", "Resultado negativo y situación complicada", "No se dispone de cierre definitivo", "Se prefiere no compartir esta información de momento"], hasOther: true, hasComment: true },

      { id: "section_2_3", type: "section", title: "Canales de venta y cartera de clientes" },
      { id: "2.3", q: "Distribución aproximada de la facturación por canal de venta.", type: "matrix", tooltip: "Indicar en qué franja de porcentaje se sitúa cada canal. No hace falta que sumen exactamente 100 %.", rows: ["Comedores escolares / colectividades", "Restauración / HORECA", "Tiendas especializadas eco", "Grupos de consumo", "Gran distribución / supermercados", "Venta a otros CAD", "Venta directa (mercados, almacén, domicilio)", "Exportación contacto directo", "Exportación a través de intermediarios", "Otros"], columns: ["0 %", "<10 %", "10–25 %", "25–50 %", ">50 %"], hasComment: true },
      { id: "2.3a", q: "Número aproximado de clientes activos en el último ejercicio.", type: "radio", tooltip: "Clientes que hayan comprado al menos una vez en el último año.", options: ["1–10", "11–25", "26–50", "51–100", "Más de 100"] },
      { id: "2.4", q: "¿Cómo de concentrada está la cartera de clientes?", type: "radio", tooltip: "Una cartera muy concentrada puede implicar más vulnerabilidad.", options: ["Diversificada (los 3 principales clientes representan menos del 25 %)", "Moderadamente concentrada (los 3 principales representan entre el 25 % y el 50 %)", "Concentrada (los 3 principales representan entre el 50 % y el 75 %)", "Muy concentrada (los 3 principales representan más del 75 %)"], hasComment: true },

      { id: "section_2_4", type: "section", title: "Acuerdos comerciales y estacionalidad" },
      { id: "2.5", q: "¿Existe experiencia trabajando con acuerdos o contratos de suministro estables?", type: "checkbox", tooltip: "Los contratos formales vinculantes son poco habituales en el sector agroecológico, pero los acuerdos basados en confianza son comunes.", options: ["Contratos formales vinculantes con clientes privados", "Contratos formales vinculantes a través de licitaciones o pliegos de la administración pública", "Acuerdos de suministro estables no vinculantes (basados en confianza y continuidad)", "Combinación de contratos formales con algunos clientes y acuerdos informales con otros", "Predominan acuerdos puntuales o de campaña", "No existen acuerdos ni contratos formales", "Hemos tenido acuerdos o contratos pero ya no se utilizan por experiencias negativas"], hasOther: true, hasComment: true },
      { id: "2.6", q: "Estacionalidad de la facturación.", type: "radio", tooltip: "La estacionalidad afecta a la capacidad de suministro continuado y a las complementariedades entre CAD.", options: ["Alta estacionalidad (grandes picos y valles a lo largo del año)", "Estacionalidad moderada con picos claros en determinados meses", "Relativamente regular pero con dependencia fuerte de algún canal concreto", "Baja estacionalidad (facturación bastante regular durante todo el año)", "Variable según el tipo de producto"], hasOther: true, hasComment: true },

      { id: "section_2_5", type: "section", title: "Márgenes y herramientas de gestión económica" },
      { id: "2.7", q: "¿Cuál es la política de márgenes comerciales?", type: "radio", tooltip: "Cómo se calcula el margen entre lo que se paga a las personas socias y lo que se cobra al cliente.", options: ["Margen fijo sobre el precio de compra a socias, igual para todos los productos y canales", "Margen fijo diferenciado por canal", "Margen fijo diferenciado por producto", "Margen diferenciado por producto y/o canal", "Lo que está acordado son los precios de compra a socias; los márgenes se estipulan en función de las oportunidades comerciales", "No hay una política de márgenes establecida, se va viendo"], hasOther: true, hasComment: true },
      { id: "2.7a", q: "Margen comercial medio aproximado sobre ventas (%).", type: "radio", tooltip: "Un dato orientativo. Los CAD con productos de alto valor añadido pueden tener medias más elevadas.", options: ["Menos del 5 %", "Menos del 10 %", "10–20 %", "21–30 %", "Más del 30 %", "No se tiene calculado", "Se prefiere no compartir de momento"], hasOther: true },
      { id: "2.8", q: "¿De qué herramientas de seguimiento económico se dispone?", type: "checkbox", tooltip: "Marcar todas las que se utilicen actualmente.", options: ["Software de gestión (POD, ERP u otro)", "Control de márgenes por producto", "Control de costes logísticos", "Cálculo de costes de producción", "Contabilidad analítica por línea de negocio", "Presupuesto anual o plan de viabilidad actualizado", "Cuadro de mando o indicadores de gestión", "Excel / hojas de cálculo propias", "Asesoría externa que lleva la parte contable/fiscal", "No se dispone de herramientas específicas"], hasOther: true, hasComment: true },
    ],
  },

  // ─── BLOQUE 3: CAPACIDAD OPERATIVA ───
  {
    id: 3,
    title: "Capacidad operativa para la intercooperación",
    icon: "⚙️",
    intro: "Esta sección se centra en la capacidad real de cada agrupación para participar en intercambios con otros CAD: con qué recursos, infraestructura y organización se cuenta hoy.",
    questions: [
      { id: "section_3_1", type: "section", title: "Planificación productiva" },
      { id: "3.1", q: "¿El CAD realiza planificación productiva con sus socias productoras?", type: "radio", tooltip: "Si se acuerda con anticipación qué productos se producirán, en qué cantidades y en qué periodos.", options: ["Sí, existe planificación y seguimiento estructurado: al menos una o dos veces al año se realiza una planificación con el conjunto de personas socias", "Sí, pero solo para determinados productos: se planifican algunos productos concretos", "Es una combinación de los dos modelos anteriores", "No existe un sistema de planificación desarrollado"], hasOther: true, hasComment: true },
      { id: "3.1a", q: "En caso de existir planificación, ¿qué tipo de acuerdos se establecen entre el CAD y las personas socias?", type: "radio", tooltip: "Grado de formalización de los compromisos de producción.", options: ["Acuerdos informales: basados en compromisos colectivos sin sanciones formales", "Acuerdos formalizados: compromisos reconocidos con posibles sanciones en el RFI", "Acuerdos parcialmente formalizados: compromisos explícitos sin régimen claro de sanciones"], hasOther: true, hasComment: true },
      { id: "3.1b", q: "¿Qué criterios guían el reparto de la planificación productiva entre las personas socias?", type: "radio", tooltip: "Cómo se decide qué personas socias producen qué productos o volúmenes.", options: ["Criterios de reparto igualitario o equilibrado", "Criterios técnicos y de capacidad productiva", "Combinación de criterios técnicos y de reparto", "Otros criterios de asignación: ___"], hasComment: true },
      { id: "3.1c", q: "¿Qué peso tienen los productos que entran en planificación productiva dentro del conjunto de la actividad comercial?", type: "radio", tooltip: "Proporción de la facturación que corresponde a productos previamente planificados.", options: ["La mayor parte de la oferta está planificada (más del 60 %)", "Una parte significativa está planificada (entre el 30 % y el 60 %)", "La planificación tiene un peso limitado (menos del 30 %)", "Los productos planificados tienen importancia estratégica aunque peso económico moderado", "No disponemos de una estimación clara"], hasOther: true },
      { id: "3.1d", q: "¿Qué nivel de cumplimiento tiene la planificación productiva del CAD?", type: "radio", tooltip: "En qué medida las producciones comprometidas se cumplen finalmente.", options: ["Alto nivel de cumplimiento (más del 80 %)", "Cumplimiento medio (entre el 60 % y el 80 %)", "Cumplimiento limitado (entre el 30 % y el 60 %)", "Cumplimiento bajo (menos del 30 %)", "No disponemos de una estimación clara"], hasComment: true },
      { id: "3.1e", q: "¿Qué tipo de gobernanza o espacios de coordinación existen para abordar la planificación productiva?", type: "radio", tooltip: "Si existen espacios donde la parte productiva y técnica se coordinan.", options: ["Existen espacios formales de gobernanza recogidos en el RFI o estatutos", "Existen espacios de coordinación pero no están formalizados", "No existen espacios estables de gobernanza; se convocan talleres puntuales"], hasOther: true, hasComment: true },
      { id: "3.1g", q: "Si existe planificación, ¿con qué frecuencia se revisa?", type: "radio", tooltip: "La frecuencia de revisión condiciona la capacidad de reacción.", options: ["Anual", "Semestral", "Trimestral", "Mensual", "No se revisa de forma periódica"], hasOther: true },

      { id: "section_3_2", type: "section", title: "Gestión de la oferta y consolidación de pedidos" },
      { id: "3.2", q: "¿Cómo se recoge la disponibilidad de producto de las personas socias?", type: "radio", tooltip: "¿Hay un sistema para saber cada semana qué producto hay disponible?", options: ["Formato estructurado con periodicidad fija (catálogo, hoja compartida, ERP, POD)", "Mensajería (WhatsApp/Telegram) y recopilación manual", "Llamadas o correos puntuales cuando hay demanda", "Cada socia gestiona por su cuenta", "En diseño, se quiere implementar"], hasOther: true, hasComment: true },
      { id: "3.3", q: "¿Tiene el CAD la capacidad de agrupar producto de varias socias y servir un pedido conjunto?", type: "radio", tooltip: "¿Puede el CAD recibir un pedido, recoger el producto de distintas fincas, consolidarlo y enviarlo como un solo envío?", options: ["Sí, con facilidad (hay estructura y se hace habitualmente)", "Sí, pero con esfuerzo o solo para ciertos productos", "Difícil hoy (falta estructura, tiempo o herramientas)", "No es una función que se asuma como CAD"], hasOther: true, hasComment: true },

      { id: "section_3_3", type: "section", title: "Distribución y alcance" },
      { id: "3.4", q: "Alcance habitual de distribución.", type: "checkbox", tooltip: "¿Hasta dónde llega el producto del CAD?", options: ["Local / comarcal", "Provincial", "Autonómico", "Interautonómico", "Estatal", "Exportación"], hasOther: true, hasComment: true },
      { id: "3.5", q: "¿El alcance de distribución varía según el tipo de producto?", type: "radio", tooltip: "Es habitual que el fresco se distribuya en radio más reducido.", options: ["No, el alcance es similar para todos los productos", "Sí, el producto fresco se distribuye en un radio más reducido que el transformado", "Sí, hay productos que se envían a nivel estatal y otros solo en local"], hasOther: true, hasComment: true },

      { id: "section_3_4", type: "section", title: "Infraestructura logística" },
      { id: "3.6", q: "¿Se dispone de flota logística propia?", type: "radio", options: ["Sí, íntegramente propia", "Mixta (propia + subcontratada)", "Totalmente subcontratada", "No se realiza distribución directa"], hasOther: true, hasComment: true },
      { id: "3.7", q: "Capacidad de almacenamiento en frío.", type: "radio", tooltip: "Condiciona directamente la capacidad de recepcionar envíos en intercambios.", options: ["No se dispone de frío", "Pequeña capacidad (< 100 m²)", "Media (100–300 m²)", "Alta (> 300 m²)"], hasOther: true, hasComment: true },
      { id: "3.8", q: "¿Qué software de gestión se utiliza actualmente?", type: "checkbox", tooltip: "Interesa de cara a la interoperabilidad entre CAD.", options: ["POD", "Otro ERP (especificar cuál)", "Excel / hojas de cálculo", "No se utiliza software de gestión específico"], hasOther: true, hasComment: true },
      { id: "3.9", q: "¿El CAD funciona o podría funcionar como centro de acopio para las personas socias?", type: "radio", tooltip: "Si las socias utilizan el CAD para abastecerse de otros productos y complementar su oferta.", options: ["Sí, ya funciona como centro de acopio para las personas socias", "No actualmente, pero podría desarrollarse si existiera interés", "No, no forma parte del modelo del CAD"], hasOther: true, hasComment: true },
      { id: "3.10", q: "¿Cuál es el ciclo de pedido habitual del CAD?", type: "textarea", tooltip: "Describir brevemente el proceso: desde que se publica la oferta hasta que se entrega." },

      { id: "section_3_5", type: "section", title: "Estructura productiva" },
      { id: "3.11", q: "Escala predominante en las unidades productivas socias.", type: "checkbox", tooltip: "Se mide en UTAs (Unidades de Trabajo Agrario).", options: ["Pequeña escala (0–3 UTAs)", "Mediana escala (3–7 UTAs)", "Gran escala (más de 7 UTAs)", "Muy heterogéneo"] },
      { id: "3.12", q: "Perfil de dedicación de la base productiva.", type: "radio", tooltip: "¿La actividad agropecuaria es la ocupación principal de la mayoría?", options: ["En su mayoría profesional", "Mixto", "Mayoría actividad complementaria", "NS/NC"] },
      { id: "3.13", q: "¿Cuántas familias de producto diferentes maneja el CAD?", type: "numeric", tooltip: "Por \"familia\" se entiende una categoría amplia: huerta, fruta, cítricos, cereales, etc.", hasComment: true },

      { id: "section_3_6", type: "section", title: "Detalle logístico" },
      { id: "3.14", q: "Metros cuadrados aproximados de almacenamiento en seco.", type: "numeric", tooltip: "Si no se dispone de espacio específico, indicar 0.", hasComment: true },
      { id: "3.15", q: "Número aproximado de vehículos operativos.", type: "radio", options: ["1", "2–3", "4–6", "Más de 6", "No aplica"] },
      { id: "3.16", q: "Tipo de vehículos disponibles.", type: "checkbox", options: ["Furgonetas refrigeradas", "Furgonetas sin frío", "Camión ligero (<3.500 kg)", "Camión medio/pesado", "Ninguno"], hasOther: true },
      { id: "3.17", q: "¿Se identifican limitaciones logísticas que puedan condicionar el crecimiento del CAD?", type: "textarea", tooltip: "Por ejemplo: falta de espacio, flota insuficiente, costes elevados, zona geográfica difícil, etc." },

      { id: "section_3_7", type: "section", title: "Valoración global" },
      { id: "3.18", q: "Capacidad del CAD para implicarse en intercooperación económica hoy.", type: "radio", tooltip: "Una valoración global y honesta. Esto no condiciona la participación del CAD en la red.", options: ["Alta (se podría empezar ya)", "Media (se necesitan algunos ajustes)", "Baja (se requieren cambios importantes)", "Nula (no es viable ahora)"], hasOther: true },
    ],
  },

  // ─── BLOQUE 4: AUTOEVALUACIÓN E INTERCAMBIOS TÉCNICOS ───
  {
    id: 4,
    title: "Necesidades de intercooperación técnica",
    icon: "🎓",
    intro: "Cada agrupación tiene fortalezas en determinados ámbitos y necesidades de mejora en otros. Conocer esto permite que las agrupaciones se encuentren entre sí y que se diseñen formaciones y acompañamientos adaptados.",
    questions: [
      { id: "section_4_2", type: "section", title: "Agenda de intercambios técnicos" },
      { id: "4.3a", q: "¿En qué temáticas técnicas estaría interesado el CAD en participar en intercambios?", type: "matrix", tooltip: "Indicar si son de interés a corto plazo (12 meses) o a medio plazo (tras el IV Encuentro).", rows: ["Costes de producción / costes de cultivo", "Planificación productiva y coordinación con la base productiva", "Calidad y manejo postcosecha", "Picking y preparación de pedidos", "Optimización de rutas y organización del reparto", "Procesos de compra a personas socias", "Intercambios de producto entre CAD de la red", "Cuadro de mando, márgenes, estructura de costes y política de precios", "Facturación electrónica y adaptación a Verifactu", "Trabajo y estrategias comerciales (según canal)", "Sistemas de indicadores y cuadro de mando de gestión", "Exploración de sistemas de visualización de datos", "Gobernanza de los CAD: equilibrio entre participación y eficiencia", "Transformados, cuarta gama"], columns: ["Corto plazo (12 meses)", "Medio plazo (tras IV Encuentro)"] },
      { id: "4.3b", q: "¿Hay alguna temática adicional que no aparezca en el listado anterior?", type: "textarea", optional: true, tooltip: "Si falta alguna temática relevante para los intercambios técnicos de la red." },
      { id: "4.3c", q: "¿Hay proyectos, experiencias o trabajos que te gustaría conocer en el marco de la red?", type: "textarea", optional: true, tooltip: "Proyectos o iniciativas de otros territorios que resulten especialmente interesantes." },
      { id: "4.3d", q: "¿Se considera que sería necesario profundizar mediante un seminario o grupo de trabajo?", type: "textarea", optional: true, tooltip: "Un seminario de 3–4 horas o un grupo de trabajo entre varios CAD." },

      { id: "section_4_3", type: "section", title: "Disponibilidad para la intercooperación técnica" },
      { id: "4.4", q: "¿Con qué frecuencia máxima se ve viable participar en sesiones de intercambio técnico online?", type: "radio", tooltip: "Ajustar la agenda de intercambios a la disponibilidad real de los CAD.", options: ["Depende de la temática: si es muy relevante, participar con más frecuencia no sería un problema", "Intensidad alta: como máximo una sesión cada dos meses (aprox. 6 sesiones al año)", "Intensidad media: en torno a 3 sesiones de intercambio al año", "Intensidad baja: como máximo 2 sesiones al año"], hasComment: true },

      { id: "section_4_4", type: "section", title: "Oficina Técnica" },
      { id: "4.5", q: "Necesidades de asesoramiento individualizado a través de la Oficina Técnica de la red.", type: "textarea", optional: true, tooltip: "La red cuenta con una Oficina Técnica orientada a apoyar a los CAD en cuestiones específicas." },
    ],
  },

  // ─── BLOQUE 5: OFERTA Y NECESIDADES ───
  {
    id: 5,
    title: "Oferta y necesidades para intercambios entre CAD",
    icon: "🌱",
    intro: "Esta sección aborda las grandes líneas de la oferta disponible y las necesidades de abastecimiento de cada agrupación. El detalle fino se trabajará aparte. Aquí se busca lo estratégico: las complementariedades entre CAD.",
    questions: [
      { id: "section_5_1", type: "section", title: "Oferta productiva" },
      { id: "5.1", q: "¿Qué grandes familias de producto puede ofrecer el CAD?", type: "checkbox", tooltip: "Marcar todas las categorías en las que haya producción, aunque sea estacional.", options: ["Huerta / hortalizas", "Fruta", "Cítricos", "Frutos secos", "Olivar / aceite", "Viña / vino", "Cereales / legumbres", "Carne", "Lácteos", "Huevos", "Apicultura", "Setas / micología", "Plantas aromáticas / medicinales", "Transformados (conservas, salsas, mermeladas, etc.)", "Panadería / harinas", "Bebidas"], hasOther: true, hasComment: true },
      { id: "5.2", q: "¿Existen excedentes estructurales o picos de producción recurrentes?", type: "radio", tooltip: "Los excedentes son la primera oportunidad de intercambio entre CAD.", options: ["Sí, de forma estructural en varias categorías", "Sí, pero solo estacionalmente o en productos concretos", "No, se vende prácticamente todo lo que se produce"], hasComment: true },
      { id: "5.3", q: "Si existen excedentes o picos, ¿en qué categorías y en qué época del año?", type: "textarea", tooltip: "Indicar las categorías principales y los meses." },
      { id: "5.4", q: "Volumen aproximado anual de producto comercializado (en toneladas).", type: "radio", tooltip: "Cifra orientativa para situar la escala física.", options: ["Menos de 50 toneladas/año", "Entre 50 y 150 toneladas/año", "Entre 150 y 300 toneladas/año", "Entre 300 y 600 toneladas/año", "Más de 600 toneladas/año"] },

      { id: "section_5_2", type: "section", title: "Necesidades de abastecimiento externo" },
      { id: "5.5", q: "¿El CAD necesita abastecerse regularmente de productos que no produce su base social?", type: "radio", tooltip: "Muchas agrupaciones complementan con compras externas para un surtido más completo.", options: ["Sí, de forma estructural", "Sí, de forma estacional", "Puntualmente, para productos concretos", "No, casi todo proviene de las personas socias"], hasOther: true, hasComment: true },
      { id: "5.6", q: "¿Qué categorías de producto se necesita adquirir externamente?", type: "checkbox", tooltip: "Cruzando con la oferta de otros CAD se identifican oportunidades.", options: ["Huerta / hortalizas", "Fruta", "Cítricos", "Frutos secos", "Olivar / aceite", "Viña / vino", "Cereales / legumbres", "Carne", "Lácteos", "Huevos", "Apicultura", "Setas / micología", "Plantas aromáticas / medicinales", "Transformados", "Panadería / harinas", "Bebidas"], hasOther: true, hasComment: true },
      { id: "5.6a", q: "Volumen aproximado anual de compras externas (€).", type: "radio", tooltip: "Dimensiona el potencial de sustitución.", options: ["Menos de 100.000 €", "100.000–300.000 €", "300.001–600.000 €", "Más de 600.000 €"] },
      { id: "5.6b", q: "Origen habitual de las compras externas.", type: "checkbox", tooltip: "¿De dónde viene actualmente el producto externo?", options: ["Proveedores locales/comarcales", "Proveedores autonómicos", "Mayoristas nacionales", "Importación", "Otros CAD de la red"], hasOther: true, hasComment: true },
      { id: "5.6c", q: "¿Qué factores se priorizan al seleccionar proveedores?", type: "checkbox", tooltip: "Para entender los criterios de compra y diseñar la propuesta de valor.", options: ["Precio", "Calidad del producto", "Certificación ecológica", "Proximidad geográfica", "Fiabilidad y regularidad en el suministro", "Relación de confianza / conocimiento personal", "Condiciones de pago", "Capacidad logística del proveedor", "Valores compartidos (economía social, agroecología)"], hasOther: true, hasComment: true },

      { id: "section_5_3", type: "section", title: "Oferta disponible para intercooperación" },
      { id: "5.7", q: "¿Qué tipo de oferta se puede facilitar desde el CAD?", type: "checkbox", tooltip: "¿El producto sale fresco, transformado, o en algún formato de valor añadido?", options: ["Producto fresco (sin transformar)", "Producto transformado (conservas, salsas, elaborados)", "Producto IV gama (lavado/cortado/listo para consumir)", "Producto V gama (cocinado/listo para calentar-servir)", "No aplica / no se sabe aún"], hasOther: true, hasComment: true },
      { id: "5.8", q: "Nivel de estabilidad de la oferta a lo largo del año.", type: "radio", tooltip: "¿Se puede garantizar continuidad en el suministro?", options: ["Alta (se puede garantizar continuidad en varias familias)", "Media (continuidad parcial + fuerte estacionalidad)", "Baja (oferta muy estacional o irregular)"], hasComment: true },
      { id: "5.9", q: "Formatos habituales de entrega.", type: "checkbox", tooltip: "¿En qué formatos sale el producto?", options: ["Granel (kg)", "Caja estándar (5/10/15 kg)", "Palé", "Unidades (pieza)", "Envasado (tarro, bolsa, botella)", "Etiquetado propio del CAD/socia", "Etiquetado adaptable según necesidad"], hasOther: true, hasComment: true },
      { id: "5.10", q: "Condiciones mínimas habituales para servir a otros CAD.", type: "checkbox", tooltip: "Si hay mínimos de pedido, volumen, frecuencia o anticipación.", options: ["Pedido mínimo", "Volumen mínimo por producto", "Frecuencia mínima (semanal/quincenal/mensual)", "Anticipación necesaria (48h/72h/1 semana/2 semanas)", "No hay mínimos definidos"], hasOther: true, hasComment: true },
      { id: "5.11", q: "Indicar hasta 10 productos que se consideran estratégicos para ofrecer a otros CAD.", type: "textarea", tooltip: "Los \"productos estrella\": aquellos con más volumen, mejor calidad, o mayor ventaja competitiva.", hasComment: true },
      { id: "5.12", q: "Adjuntar oferta estable, catálogo o calendario de producción si se dispone.", type: "file", optional: true },

      { id: "section_5_4", type: "section", title: "Disposición a la intercooperación" },
      { id: "5.13", q: "¿Existe disposición a ofrecer producto a otros CAD de la red?", type: "checkbox", options: ["Sí, es algo que ya se hace o se quiere hacer", "Sí, si se dan unas condiciones mínimas (precio, volumen, logística)", "No hay capacidad de oferta de producto, pero sí de facilitar la apertura de mercado en el territorio", "Interesa pero se necesita madurar la idea internamente", "No se ve viable ahora mismo"], hasOther: true, hasComment: true },
      { id: "5.14", q: "¿Existe disposición a sustituir parte de las compras externas por compras a otros CAD?", type: "radio", tooltip: "¿Se consideraría cambiar si un CAD de la red ofrece condiciones similares?", options: ["Sí, sin duda, si las condiciones son competitivas", "Sí, aunque se priorizarían proveedores locales con los que ya se trabaja", "Habría que valorarlo según producto y condiciones", "No se ve viable"], hasComment: true },
      { id: "5.15", q: "¿Se está intercambiando ya producto con algún otro CAD de la red?", type: "textarea", optional: true, tooltip: "Si ya existen intercambios informales o formales, indicar con cuáles y qué productos." },

      { id: "section_5_5", type: "section", title: "Necesidades de inversión y proyectos conjuntos" },
      { id: "5.16", q: "¿Tiene el CAD identificada alguna necesidad de inversión que podría plantearse con otros CAD?", type: "textarea", optional: true, tooltip: "En el III Encuentro surgieron cuestiones que podrían abordarse de forma conjunta (ej. cajas)." },
      { id: "5.17", q: "¿Tiene el CAD algún diagnóstico preliminar de necesidades que explorar de forma coordinada a medio/largo plazo?", type: "textarea", optional: true, tooltip: "Inversiones, asistencias técnicas u otras cuestiones que se beneficiarían de abordaje conjunto." },
    ],
  },

  // ─── BLOQUE 5b: INTERCAMBIOS DE PRODUCTO Y CONSUMO INTERNO ───
  {
    id: "5b",
    title: "Intercambios de producto y consumo interno dentro de la Red",
    icon: "🛒",
    intro: "Este bloque se centra en identificar las posibilidades concretas de intercambio de producto entre los CAD de la Red: qué se puede ofrecer, qué se necesita, qué modalidades de cooperación interesan más y qué condiciones se consideran prioritarias para que los intercambios funcionen.",
    questions: [
      { id: "section_5b_1", type: "section", title: "Oferta disponible y necesidades de producto" },
      { id: "5b.1", q: "Por favor, indica los productos que tu CAD ofrece actualmente o podría ofrecer de forma estable al resto de la Red.", type: "textarea", tooltip: "Respuesta abierta o listado de productos." },
      { id: "5b.2", q: "De ese listado, ¿existen algunos productos que consideras especialmente estratégicos por su volumen disponible, excedentes, calidad, capacidad productiva o facilidad de suministro? Indica cuáles y por qué.", type: "textarea", tooltip: "Interesa conocer qué productos tienen mayor potencial para los intercambios entre CAD." },
      { id: "5b.3", q: "¿Qué productos os interesa incorporar a vuestra oferta porque ya os los están demandando vuestros clientes actuales y tenéis dificultades para conseguirlos en vuestro territorio?", type: "textarea", tooltip: "Si es posible, indica también el canal de comercialización al que irían destinados (restauración colectiva, grupos de consumo, tiendas especializadas, distribución, etc.)." },

      { id: "section_5b_2", type: "section", title: "Canales de comercialización y planificación conjunta" },
      { id: "5b.4", q: "¿En qué canales de comercialización habéis identificado que una mayor cooperación entre los CAD a escala estatal podría aportar un mayor valor?", type: "textarea", tooltip: "Por ejemplo, restauración colectiva para complementar la oferta de fruta entre febrero y mayo, distribución especializada, grupos de consumo, venta online, etc. Explica brevemente el caso si lo consideras oportuno." },
      { id: "5b.5", q: "¿Tienes identificado algún producto que te gustaría planificar conjuntamente con otro CAD para disponer de una producción más temprana, más tardía o prolongar su disponibilidad a lo largo del año?", type: "textarea", tooltip: "En caso afirmativo, indica qué producto(s), con qué CAD (si lo tienes identificado) y con qué objetivo." },
      { id: "5b.6", q: "Pensando en reforzar la demanda que ya genera vuestro CAD, ¿habéis identificado productos que vuestros socios y socias necesitan (o podrían necesitar próximamente) para abastecer sus propios canales comerciales y que actualmente vuestro CAD no ofrece?", type: "textarea", tooltip: "En ese caso, vuestro CAD podría ejercer también una función de acopio para sus socios. Indica los productos si los tienes identificados." },

      { id: "section_5b_3", type: "section", title: "Situación actual y modalidades de cooperación" },
      { id: "5b.7", q: "¿Ya recibes o suministras productos a otros CAD de la Red?", type: "radio", options: ["Sí, recibimos productos", "Sí, suministramos productos", "Sí, ambas cosas", "No"], hasComment: true },
      { id: "5b.8", q: "De partida, ¿qué modalidades de cooperación comercial consideras más interesantes para vuestro CAD?", type: "checkbox", tooltip: "Puedes marcar varias opciones.", options: ["Compra de productos entre CAD", "Venta de productos entre CAD", "Intercambio de excedentes", "Compras conjuntas", "Venta conjunta a clientes comunes", "Planificación conjunta de cultivos", "Especialización productiva entre territorios", "Compartir logística", "Compartir almacenamiento"], hasOther: true, hasComment: true },
      { id: "5b.9", q: "¿Hay algún otro producto, oportunidad o necesidad relacionada con los intercambios entre CAD que no se haya recogido en las preguntas anteriores y que consideres importante compartir?", type: "textarea", optional: true },

      { id: "section_5b_4", type: "section", title: "Priorización de aspectos clave para los intercambios" },
      { id: "5b.10", q: "Por último, clasifica las siguientes cuestiones según el momento en el que consideras que deberían abordarse para impulsar los intercambios de producto entre los CAD.", type: "matrix", tooltip: "Asigna: 1 = Imprescindible desde el inicio. 2 = Importante, primer año de trabajo. 3 = Necesario, horizonte de hasta 2 años.", rows: ["Confianza entre los CAD", "Transparencia en la formación de precios", "Acuerdos claros sobre precios, márgenes y condiciones comerciales", "Planificación conjunta de la producción", "Información compartida sobre disponibilidad de producto", "Calendarios conjuntos de producción y campañas", "Compromisos estables de compra y venta entre CAD", "Garantías comunes de calidad y criterios compartidos", "Protocolos para la gestión de incidencias y devoluciones", "Coordinación logística y del transporte", "Disponibilidad de puntos de acopio territoriales", "Herramienta digital compartida para visualizar oferta y demanda", "Sistema ágil de comunicación entre los CAD", "Trazabilidad e intercambio de información sobre el origen de los productos", "Simplificación administrativa y de facturación", "Apoyo técnico para facilitar la coordinación entre organizaciones", "Especialización productiva y complementariedad entre territorios", "Otro (especificar)"], columns: ["1 Imprescindible desde el inicio", "2 Importante, primer año", "3 Necesario, horizonte 2 años"], hasComment: true },
    ],
  },

  // ─── BLOQUE 6: CALIDAD ───
  {
    id: 6,
    title: "Calidad y capacidad para nuevos canales",
    icon: "✅",
    intro: "Uno de los elementos clave para el desarrollo de los CAD es la gestión de los sistemas de calidad y de control del producto. Resulta relevante tanto para facilitar intercambios entre CAD como para valorar el acceso conjunto a nuevos canales.",
    questions: [
      { id: "section_6_1", type: "section", title: "Fichas técnicas y protocolos de calidad" },
      { id: "6.1", q: "¿Se dispone de fichas técnicas de los productos?", type: "radio", tooltip: "Las fichas técnicas son un requisito básico para canales de distribución profesional y para intercambios entre CAD.", options: ["Sí, para todos o la mayoría de productos", "Sí, pero solo para algunos productos o clientes que lo exigen", "No, pero se está trabajando en ello", "No, lo tenemos diagnosticado pero nos falta tiempo", "No lo tenemos contemplado"], hasOther: true, hasComment: true },
      { id: "6.2", q: "¿Existe algún tipo de política o protocolo de calidad? ¿Existe una persona encargada de recepcionar y revisar el producto?", type: "radio", tooltip: "El control de calidad en recepción es uno de los indicadores más claros de la madurez operativa.", options: ["Sí, con protocolo escrito y persona/equipo responsable", "Hay criterios compartidos pero no están formalizados", "Se gestiona caso a caso, sin protocolo establecido", "No"], hasOther: true, hasComment: true },

      { id: "section_6_2", type: "section", title: "Certificaciones y trazabilidad" },
      { id: "6.3", q: "¿Se dispone de certificaciones adicionales a la certificación ecológica?", type: "checkbox", tooltip: "Las certificaciones adicionales amplían posibilidades de acceso a nuevos canales. Es solo informativo.", options: ["GlobalGAP", "Demeter (biodinámica)", "Certificación de comercio justo", "Certificación de residuo cero o similar", "ISO / AENOR", "BRC / IFS", "Producción integrada", "Ninguna adicional"], hasOther: true },
      { id: "6.4", q: "En materia de trazabilidad y registros, ¿cuál es la situación actual?", type: "checkbox", tooltip: "La trazabilidad completa es un requisito habitual en distribución profesional y restauración colectiva.", options: ["Trazabilidad completa para todos los productos", "Trazabilidad completa para la mayoría de productos", "Se cumple con lo que exigen las auditorías y los clientes", "Trazabilidad parcial, hay margen de mejora", "No se dispone de un sistema de trazabilidad estructurado"], hasOther: true, hasComment: true },
      { id: "6.4a", q: "¿Cómo se gestiona actualmente la relación con auditorías y controles oficiales?", type: "checkbox", tooltip: "Un CAD que pasa auditorías sin incidencias tiene un nivel de base sólido.", options: ["Las auditorías del CAE se pasan sin incidencias relevantes", "Las inspecciones de sanidad/seguridad alimentaria se pasan sin incidencias", "Se han tenido incidencias o no conformidades en alguna auditoría reciente", "La gestión de auditorías la lleva una persona o equipo dedicado", "La gestión recae en la misma persona que lleva otras tareas", "Se externaliza la preparación de auditorías"], hasOther: true, hasComment: true },

      { id: "section_6_3", type: "section", title: "Incidencias y capacidad de adaptación" },
      { id: "6.5", q: "¿En qué nivel de incidencias de devolución de producto se ha movido el CAD en el último año?", type: "radio", tooltip: "Se refiere a devoluciones o reclamaciones relevantes que hayan implicado reposición, descuento o retirada.", options: ["Muy bajo (aprox. <0,5 % de los pedidos anuales)", "Bajo (aprox. entre 0,5 % y 2 %)", "Moderado (aprox. entre 2 % y 5 %)", "Alto (aprox. entre 5 % y 10 %)", "Muy alto (más del 10 %)", "No llevamos un registro sistemático de incidencias"], hasComment: true },
      { id: "6.6", q: "¿Podría adaptarse el etiquetado de producto a las necesidades de un cliente conjunto de la red?", type: "radio", tooltip: "Si la red presenta una oferta conjunta, ¿sería viable adaptar el etiquetado?", options: ["Sí, sin problema", "Sí, pero requeriría inversión o cambios en el proceso", "Habría que valorarlo, pero esto ahora mismo lo vemos a año luz", "No se ve viable"], hasComment: true },
    ],
  },

  // ─── BLOQUE 7: IDENTIDAD COLECTIVA ───
  {
    id: 7,
    title: "Identidad colectiva y herramientas de comunicación",
    icon: "🌐",
    intro: "La red está dando sus primeros pasos y una de las cuestiones planteadas en los encuentros es cómo queremos presentarnos y cómo nos comunicamos. Estas preguntas recogen preferencias para ir construyendo herramientas de forma compartida.",
    questions: [
      { id: "7.1", q: "¿Resultaría interesante que la red disponga de una imagen colectiva? ¿En qué horizonte temporal?", type: "radio", tooltip: "Una imagen colectiva puede ser útil para acciones comerciales conjuntas o visibilidad, sin perder la identidad propia.", options: ["Sí, sería interesante desarrollarla en el corto plazo (próximos 12 meses)", "Sí, sería interesante pero más adelante, en el medio plazo (tras el IV Encuentro)", "No lo vemos prioritario ahora mismo"], hasOther: true, hasComment: true },
      { id: "7.2", q: "¿Qué tipo de presencia o herramientas compartidas podrían ser útiles para la red?", type: "checkbox", tooltip: "Marcar todas las que se consideren útiles. No implica compromiso de uso inmediato.", options: ["Una web pública de la red con presentación de las agrupaciones", "Un espacio privado / intranet con información interna", "Un catálogo o herramienta comercial conjunta para presentar la oferta a clientes", "Fichas de presentación de cada CAD para uso comercial compartido", "Materiales de comunicación compartidos (folletos, presentaciones, plantillas)"], hasOther: true, hasComment: true },
      { id: "7.3", q: "En caso de que la red impulse un proceso de acogida para nuevas agrupaciones, ¿existiría interés en participar?", type: "radio", tooltip: "Que una agrupación con experiencia acompañe a una recién llegada durante sus primeros meses.", options: ["Sí, y habría disposición a apadrinar a una agrupación nueva", "Sí, parece una buena idea aunque no se pueda asumir el apadrinamiento ahora", "No lo vemos prioritario"], hasOther: true, hasComment: true },
    ],
  },

  // ─── BLOQUE 8: EXPECTATIVAS Y PRIORIDADES ───
  {
    id: 8,
    title: "Expectativas, prioridades y participación",
    icon: "🎯",
    intro: "Resulta importante conocer qué se espera de este proceso y dónde se pondrían las prioridades. Como se viene planteando desde Valencia: \"hay que cuidar la red para que la red nos cuide\".",
    questions: [
      { id: "section_8_1", type: "section", title: "Expectativas" },
      { id: "8.1", q: "¿Qué se espera que aporte la intercooperación económica?", type: "checkbox", tooltip: "Marcar todas las que apliquen. Permite priorizar las primeras acciones.", options: ["Complementar la oferta con productos de otros territorios que permitan ampliar catálogo", "Dar salida a excedentes o productos con dificultad de venta", "Acceder conjuntamente a canales donde es difícil llegar de forma individual", "Mejorar el funcionamiento integral del CAD a partir del conocimiento técnico de la red", "Acceder conjuntamente a proyectos o subvenciones", "Disponer de un espacio de apoyo en momentos económicos difíciles", "Ganar fuerza de negociación conjunta frente a clientes o proveedores", "Estandarizar procesos, formatos y herramientas entre las agrupaciones"], hasOther: true, hasComment: true },
      { id: "8.2", q: "¿Qué se espera que aporte la intercooperación técnica?", type: "checkbox", tooltip: "El programa se diseñará en función de lo que se exprese aquí.", options: ["Formaciones prácticas sobre temas compartidos", "Intercambio de experiencias entre agrupaciones con retos similares", "Acceso a un repositorio de materiales, guías y buenas prácticas", "Asesoramiento técnico adaptado al nivel de madurez de cada agrupación", "Conocer cómo trabajan otros CAD en el día a día (visitas, sesiones abiertas)", "Un espacio de intercambio estable, eficiente y adaptado", "Traer otras experiencias fuera de la red que puedan ser inspiradoras", "Un canal de comunicación ágil para consultas informales entre agrupaciones"], hasOther: true, hasComment: true },
      { id: "8.3", q: "¿Qué se espera en materia de participación en la red, gobernanza y Plan Estratégico?", type: "checkbox", tooltip: "La red tiene una estructura de gobernanza en construcción.", options: ["Dotarse de una figura jurídica propia como red", "Contribuir a la elaboración del Plan Estratégico de la red", "Tener voz en las decisiones sin necesariamente estar en el Grupo Motor", "Recibir información clara y periódica de lo que se hace desde la red", "Participar en la formulación y presentación de proyectos conjuntos", "Que la red facilite el acceso a financiación o proyectos para las agrupaciones"], hasOther: true, hasComment: true },

      { id: "section_8_2", type: "section", title: "Prioridades para este año" },
      { id: "8.4", q: "¿Se considera que falta alguna acción relevante que debería incorporarse entre las prioridades del corto plazo?", type: "info", description: "En el III Encuentro se identificaron estas prioridades:\n• Elaborar un Plan Estratégico de la red.\n• Estructurar y desarrollar el área de intercooperación técnica.\n• Formular al menos un proyecto conjunto.\n• Diagnosticar y caracterizar bien cada CAD.\n• Estimular los intercambios con una figura facilitadora.\n• Identificar posibilidades de compras conjuntas." },
      { id: "8.4a", q: "¿Falta alguna acción relevante?", type: "textarea", optional: true },

      { id: "section_8_3", type: "section", title: "Capacidad de dedicación" },
      { id: "8.5", q: "¿Qué capacidad de dedicación real existe para participar en cada línea de trabajo?", type: "matrix", tooltip: "Puede haber alta prioridad pero baja capacidad, o viceversa.", rows: ["Elaboración del Plan Estratégico de la red", "Intercooperación técnica e intercambios entre CAD", "Formulación de proyectos conjuntos", "Desarrollo de los primeros intercambios de producto entre CAD"], columns: ["Alta (se puede asignar tiempo y personas)", "Media (se puede participar con limitaciones)", "Baja (interesa pero no hay capacidad ahora)"], hasComment: true },

      { id: "section_8_4", type: "section", title: "Cierre" },
      { id: "8.6", q: "¿Hay algo más que se quiera compartir y que no se haya preguntado?", type: "textarea", optional: true, tooltip: "Espacio abierto. A veces lo más valioso aparece aquí." },
    ],
  },
];
