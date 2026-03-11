"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/supabase";
import { HelpCircle } from "lucide-react";

export const MADUREZ_TOOLTIPS = {
  "Planificación productiva": "Capacidad para coordinar los cultivos de la base social con antelación, basándose en la demanda esperada para evitar excedentes o faltas de producto.",
  "Gestión comercial": "Capacidad para buscar proactivamente nuevos clientes, fijar precios rentables y mantener una relación fluida con los canales de venta.",
  "Costes de producción": "Capacidad de calcular y hacer un seguimiento real de cuánto cuesta producir y final distribución de cada producto para garantizar la viabilidad.",
  "Logística": "Eficiencia en la recogida, almacenamiento (en frío o en seco), preparación de pedidos y distribución física al cliente final o punto intermedio.",
  "Calidad": "Estandarización de calibres, maduración, presentación del producto, y protocolos de revisión y gestión de mermas e incidencias.",
  "Digitalización": "Uso sistemático de herramientas digitales (ERP, POD, etc.) para la gestión integral, trazabilidad, facturación y catálogo de productos.",
  "Gobernanza interna": "Claridad en los procesos de toma de decisiones, roles asignados y nivel de participación democrática y cohesión de la base social.",
  "Marketing": "Generación de una identidad clara, materiales comerciales y presencia (digital o física) para poner en valor el proyecto y sus productos.",
  "Administración": "Solidez y orden en la contabilidad, fiscalidad, facturación, cobros/pagos y trámites burocráticos.",
  "Restauración colectiva": "Experiencia y capacidad para servir a colegios, hospitales u otros comedores públicos/privados de forma constante."
};
const COLORS = {
  forest: "#2E5339",
  forestLight: "#3a6b4a",
  sage: "#8BAA7C",
  cream: "#FAFAF5",
  sand: "#F0EDE4",
  warmGray: "#6B6560",
  text: "#2C2926",
  textLight: "#7A756F",
  accent: "#C4956A",
  white: "#FFFFFF",
  border: "#DDD8D0",
  red: "#C45C4A",
};

const blocks = [
  {
    id: 0,
    title: "Validación ficha",
    icon: "📋",
    intro: "Se ha preparado desde la red una ficha con los datos básicos de cada agrupación. Se invita a revisarla e indicar si hay algo que actualizar.",
    questions: [
      { id: "0.1", q: "¿Los datos de la ficha enviada son correctos?", type: "radio", options: ["Sí, todo correcto", "No, hay datos que actualizar"] },
      { id: "0.2", q: "Si hay datos que actualizar, indicar cuáles.", type: "textarea", conditional: true },
      { id: "0.3", q: "Persona de contacto principal para intercooperación económica (nombre, cargo, email, teléfono).", type: "textarea" },
      { id: "0.4", q: "¿Hay una segunda persona de contacto para estos temas?", type: "textarea", optional: true },
    ],
  },
  {
    id: 1,
    title: "Gobernanza interna",
    icon: "🤝",
    intro: "Resulta importante entender cómo se organiza y toma decisiones cada agrupación. Cada CAD tiene su forma de funcionar, y eso condiciona cómo se puede cooperar entre todos.",
    questions: [
      { id: "1.1", q: "¿Cómo se toman las decisiones comerciales en el CAD?", type: "radio", options: ["El equipo técnico/gerencia tiene autonomía para decisiones del día a día", "Las decisiones relevantes pasan por una comisión o grupo de trabajo", "Las decisiones importantes requieren aprobación de la junta/asamblea", "No hay un proceso definido, se va decidiendo sobre la marcha"], hasOther: true },
      { id: "1.2", q: "¿Quién coordina actualmente la oferta y la relación con clientes?", type: "radio", options: ["Equipo técnico / personal contratado con dedicación", "Una comisión comercial de personas socias", "La junta directiva o coordinación general, entre otras tareas", "Liderazgos informales de socios/as", "No hay nadie con esa función clara"], hasOther: true },
      { id: "1.3", q: "¿Se ha tratado internamente el tema de comprar o vender producto a otros CAD de la red?", type: "radio", options: ["Sí, y hay respaldo claro para avanzar", "Sí, pero hay dudas o resistencias que se están trabajando", "No, todavía no se ha planteado formalmente", "No aplica, la decisión la toma el equipo técnico directamente"] },
      { id: "1.4", q: "Si hay dudas o resistencias internas, ¿cuáles son?", type: "textarea", optional: true },
      { id: "1.5", q: "¿Cómo se describiría la relación entre el equipo técnico y la base social productora?", type: "radio", options: ["Fuerte: las personas productoras confían y participan activamente", "Funcional: la delegación funciona, aunque la participación es limitada", "Frágil: hay tensiones o desconexión", "No aplica: son las propias personas productoras quienes gestionan el CAD"], hasOther: true },
      { id: "1.6", q: "¿Existe algún servicio o rol externalizado clave para el funcionamiento del CAD?", type: "textarea", optional: true },
    ],
  },
  {
    id: 2,
    title: "Modelo de negocio",
    icon: "📊",
    intro: "Como red es importante tener una imagen clara de dónde está cada agrupación. Como se planteó en Granada: \"tener un espacio donde expresar necesidades, poder compartir un momento económico complicado\".",
    questions: [
      { id: "2.1", q: "Volumen aproximado de facturación anual.", type: "radio", options: ["Menos de 50.000 €", "50.000 – 150.000 €", "150.000 – 300.000 €", "300.000 – 600.000 €", "600.000 – 1.000.000 €", "1.000.000 – 1.500.000 €", "Más de 1.500.000 €", "Se prefiere no compartir de momento"], hasComment: true },
      { id: "2.2", q: "¿Cómo ha evolucionado la facturación en los últimos 3 años?", type: "radio", options: ["Crecimiento sostenido (>10% anual)", "Crecimiento moderado (<10% anual)", "Estable", "Irregular (altibajos significativos)", "Descenso", "Sin histórico suficiente", "Se prefiere no compartir"], hasOther: true },
      { id: "2.3", q: "¿El CAD genera resultado positivo?", type: "radio", options: ["Sí, resultado positivo consolidado", "Equilibrio (sin pérdidas pero sin margen significativo)", "Resultado negativo pero dentro de lo previsto", "Resultado negativo y situación complicada", "No se dispone de cierre definitivo", "Se prefiere no compartir de momento"], hasOther: true, hasComment: true },
      { id: "2.4", q: "Distribución aproximada de facturación por canal de venta.", type: "info", description: "En el formulario final se incluirá una matriz de canales × porcentajes. Canales: Comedores escolares, Restauración/HORECA, Tiendas eco, Grupos de consumo, Gran distribución, Venta a otros CAD, Venta directa, Exportación." },
      { id: "2.5", q: "¿Cómo de concentrada está la cartera de clientes?", type: "radio", options: ["Diversificada (los 3 principales < 25%)", "Moderadamente concentrada (25-50%)", "Concentrada (> 50%)"], hasComment: true },
      { id: "2.6", q: "¿Existe experiencia con contratos de suministro estables o plurianuales?", type: "radio", options: ["Sí, es la forma habitual con determinados clientes", "Sí, con algunos clientes", "No, pero interesaría", "No, y no se ve viable ahora", "Se ha tenido, pero ya no"], hasOther: true },
      { id: "2.7", q: "Estacionalidad de la facturación.", type: "radio", options: ["Alta estacionalidad (grandes picos y valles)", "Moderada con picos claros en determinados meses", "Regular pero con dependencia de algún canal concreto", "Baja (bastante regular todo el año)", "Variable según tipo de producto"], hasOther: true, hasComment: true },
      { id: "2.8", q: "¿Cuál es la política de márgenes comerciales?", type: "radio", options: ["Margen fijo sobre precio de compra, igual para todos los productos", "Margen diferenciado por producto y/o canal", "No hay política establecida, se va viendo"], hasOther: true, hasComment: true },
      { id: "2.9", q: "¿De qué herramientas de seguimiento económico se dispone?", type: "checkbox", options: ["Software de gestión (POD, ERP u otro)", "Control de márgenes por producto", "Control de costes logísticos", "Cálculo de costes de producción", "Contabilidad analítica por línea de negocio", "Presupuesto anual o plan de viabilidad", "Cuadro de mando o indicadores", "Excel / hojas de cálculo propias", "Asesoría externa contable/fiscal", "No se dispone de herramientas específicas"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 3,
    title: "Capacidad operativa",
    icon: "⚙️",
    intro: "Esta sección se centra en la capacidad real de cada agrupación para participar en intercambios: recursos, infraestructura y organización disponibles hoy.",
    questions: [
      { id: "3.1", q: "¿El CAD realiza planificación productiva o coordinación de oferta con sus socias?", type: "radio", options: ["Sí, de forma regular", "Sí, pero solo para determinados productos o campañas", "Coordinación informal, sin planificación estructurada", "No existe coordinación de oferta"], hasOther: true, hasComment: true },
      { id: "3.2", q: "¿Cómo se recoge la disponibilidad de producto de las personas socias?", type: "radio", options: ["Formato estructurado con periodicidad fija (catálogo, ERP, POD)", "Mensajería (WhatsApp/Telegram) y recopilación manual", "Llamadas o correos puntuales cuando hay demanda", "Cada socia gestiona por su cuenta", "En diseño, se quiere implementar"], hasOther: true },
      { id: "3.3", q: "¿Se podría hoy consolidar y servir un pedido conjunto a otro CAD o cliente externo?", type: "radio", options: ["Sí, con facilidad", "Sí, pero con esfuerzo o solo para ciertos productos", "Difícil hoy (falta estructura, tiempo o herramientas)", "No es una función que se asuma como CAD"], hasOther: true, hasComment: true },
      { id: "3.4", q: "Modelo de abastecimiento predominante.", type: "radio", options: ["Solo producción de socias", "Producción de socias + compras externas con proveedores estables", "Producción de socias + compras externas según necesidad", "Mayoritariamente compras externas"], hasOther: true },
      { id: "3.5", q: "Alcance habitual de distribución.", type: "checkbox", options: ["Local / comarcal", "Provincial", "Autonómico", "Interautonómico", "Estatal"], hasOther: true, hasComment: true },
      { id: "3.5a", q: "¿El alcance de distribución varía según el tipo de producto?", type: "radio", options: ["No, es similar para todos los productos", "Sí, el fresco se distribuye en radio más reducido", "Sí, hay productos estatales y otros solo locales"], hasOther: true, hasComment: true },
      { id: "3.6", q: "¿Se dispone de flota logística propia?", type: "radio", options: ["Sí, íntegramente propia", "Mixta (propia + subcontratada)", "Totalmente subcontratada", "No se realiza distribución directa"], hasOther: true, hasComment: true },
      { id: "3.7", q: "Capacidad de almacenamiento en frío.", type: "radio", options: ["No se dispone de frío", "Pequeña capacidad (< 100 m²)", "Media (100-300 m²)", "Alta (> 300 m²)"], hasOther: true, hasComment: true },
      { id: "3.8", q: "¿Qué software de gestión se utiliza actualmente?", type: "checkbox", options: ["POD", "Otro ERP (especificar)", "Excel / hojas de cálculo", "No se utiliza software específico"], hasOther: true, hasComment: true },
      { id: "3.8a", q: "¿El CAD funciona o podría funcionar como centro de acopio para la red?", type: "radio", options: ["Sí, ya funciona como centro de acopio para las socias", "Sí, y podría ser punto de acopio intermedio para otros CAD", "No actualmente, pero se dispone de infraestructura", "No se dispone de infraestructura ni capacidad"], hasOther: true, hasComment: true },
      { id: "3.8b", q: "¿Cuál es el tiempo de respuesta habitual para servir un pedido?", type: "radio", options: ["24 horas", "48 horas", "72 horas", "1 semana o más", "Variable según producto y época"], hasOther: true, hasComment: true },
      { id: "3.9", q: "Principales dificultades para coordinar oferta entre las personas socias.", type: "checkbox", options: ["Falta de tiempo / sobrecarga de trabajo", "Falta de herramienta común", "Producciones muy diversas", "Estacionalidad y discontinuidad", "Diferencias de precios entre socias", "Logística", "Falta de liderazgo o roles claros", "Falta de infraestructuras", "Limitaciones digitales de las socias", "Limitaciones de conectividad", "Perfil de edad avanzada de la base social", "Dificultad para encontrar personal técnico"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 4,
    title: "Madurez e intercoop técnica",
    icon: "🔬",
    intro: "Cada agrupación tiene fortalezas y necesidades diferentes. Situarse de forma honesta en cada ámbito permite que la red organice mejor sus recursos y que las agrupaciones se encuentren entre sí.",
    questions: [
      {
        id: "4.1",
        q: "Autoevaluación de madurez por ámbitos.",
        type: "matrix",
        options: ["🔴 Necesita apoyo", "🟡 En desarrollo", "🟢 Consolidado"],
        rows: ["Planificación productiva", "Gestión comercial", "Costes de producción", "Logística", "Calidad", "Digitalización", "Gobernanza interna", "Marketing", "Administración", "Restauración colectiva"]
      },
      { id: "4.1a", q: "¿En qué ámbitos considera que su agrupación es especialmente fuerte y tiene prácticas consolidadas que podrían servir de inspiración al resto de la red?", type: "textarea", optional: true },
      { id: "4.1b", q: "¿En qué ámbitos se encuentran las mayores dificultades o 'cuellos de botella' que limitan el crecimiento o estabilidad de la agrupación actualmente?", type: "textarea", optional: true },
      { id: "4.2", q: "¿En qué ámbitos se podría compartir experiencia con otros CAD?", type: "checkbox", options: ["Planificación productiva", "Gestión comercial", "Costes de producción", "Logística y distribución", "Calidad y trazabilidad", "Digitalización", "Gobernanza interna", "Marketing y comunicación", "Gestión administrativa", "Restauración colectiva y compra pública"], hasOther: true, hasComment: true },
      { id: "4.3", q: "¿En qué ámbitos se necesitaría más apoyo o formación?", type: "checkbox", options: ["Planificación productiva", "Gestión comercial", "Costes de producción", "Logística y distribución", "Calidad y trazabilidad", "Digitalización", "Gobernanza interna", "Marketing y comunicación", "Gestión administrativa", "Restauración colectiva y compra pública"], hasOther: true, hasComment: true },
      { id: "4.4", q: "¿Existe disposición a participar activamente en espacios de intercooperación técnica?", type: "radio", options: ["Sí, tanto asistiendo como aportando", "Sí, principalmente como participante", "Interesa pero hay poca disponibilidad", "No es prioritario ahora"], hasOther: true, hasComment: true },
      { id: "4.5", q: "¿Hay alguna persona que podría actuar como referente o embajadora en algún tema concreto?", type: "textarea", optional: true },
    ],
  },
  {
    id: 5,
    title: "Oferta y necesidades",
    icon: "🌱",
    intro: "Las grandes líneas de oferta disponible y necesidades de abastecimiento. El detalle fino se trabajará aparte con los datos de los sistemas de gestión.",
    questions: [
      { id: "5.1", q: "¿Qué grandes familias de producto puede ofrecer el CAD?", type: "checkbox", options: ["Huerta / hortalizas", "Fruta", "Cítricos", "Frutos secos", "Olivar / aceite", "Viña / vino", "Cereales / legumbres", "Carne", "Lácteos", "Huevos", "Apicultura", "Transformados", "Panadería / harinas", "Bebidas"], hasOther: true },
      { id: "5.2", q: "¿Existen excedentes estructurales o picos de producción recurrentes?", type: "radio", options: ["Sí, de forma estructural en varias categorías", "Sí, pero solo estacionalmente o en productos concretos", "No, se vende prácticamente todo"] },
      { id: "5.3", q: "Si existen excedentes o picos, ¿en qué categorías y en qué época del año?", type: "textarea", optional: true },
      { id: "5.4", q: "¿El CAD necesita abastecerse regularmente de productos externos a su base social?", type: "radio", options: ["Sí, de forma estructural", "Sí, de forma estacional", "Puntualmente, para productos concretos", "No, casi todo proviene de las personas socias"], hasOther: true },
      { id: "5.5", q: "¿Qué categorías de producto se necesita adquirir externamente?", type: "checkbox", options: ["Huerta / hortalizas", "Fruta", "Cítricos", "Frutos secos", "Olivar / aceite", "Cereales / legumbres", "Carne", "Lácteos", "Transformados", "Panadería / harinas", "Bebidas"], hasOther: true },
      { id: "5.6", q: "¿Existe disposición a ofrecer producto a otros CAD de la red?", type: "radio", options: ["Sí, es algo que ya se hace o se quiere hacer", "Sí, si se dan condiciones mínimas", "No hay capacidad de oferta, pero sí de facilitar apertura de mercado en el territorio", "Interesa pero se necesita madurar internamente", "No se ve viable ahora mismo"], hasOther: true, hasComment: true },
      { id: "5.7", q: "¿Existe disposición a sustituir compras externas por compras a otros CAD?", type: "radio", options: ["Sí, si las condiciones son competitivas", "Sí, aunque se priorizarían proveedores locales actuales", "Habría que valorarlo según producto y condiciones", "No se ve viable"] },
      { id: "5.8", q: "¿Se está intercambiando ya producto con algún otro CAD de la red?", type: "textarea", optional: true },
    ],
  },
  {
    id: 6,
    title: "Calidad",
    icon: "✅",
    intro: "Una de las oportunidades de la red es acceder conjuntamente a canales de venta que individualmente resultan difíciles. Para plantear estas oportunidades, es importante conocer la capacidad de calidad y servicio a nivel de red.",
    questions: [
      { id: "6.1", q: "¿Se dispone de fichas técnicas de los productos?", type: "radio", options: ["Sí, para todos o la mayoría", "Sí, pero solo para algunos productos o clientes", "No, pero se está trabajando en ello", "No"], hasOther: true, hasComment: true },
      { id: "6.2", q: "¿Existe algún tipo de política o protocolo de calidad?", type: "radio", options: ["Sí, con protocolo escrito y persona responsable", "Hay criterios compartidos pero no formalizados", "Se gestiona caso a caso", "No"], hasOther: true, hasComment: true },
      { id: "6.3", q: "¿Hay alguien revisando el producto antes de salir al cliente?", type: "radio", options: ["Sí, siempre, con criterios definidos", "Sí, de forma visual/informal", "Solo para determinados clientes o productos", "No, va directamente de la socia al cliente"], hasOther: true, hasComment: true },
      { id: "6.4", q: "¿Se dispone de certificaciones adicionales a la ecológica?", type: "checkbox", options: ["GlobalGAP", "Demeter", "Comercio justo", "Residuo cero o similar", "ISO / AENOR", "BRC / IFS", "Ninguna adicional"], hasOther: true },
      { id: "6.5", q: "En materia de trazabilidad y registros, ¿cuál es la situación?", type: "radio", options: ["Trazabilidad completa para todos los productos", "Trazabilidad completa para la mayoría", "Se cumple con lo que exigen las auditorías", "Trazabilidad parcial, hay margen de mejora", "No hay sistema estructurado"], hasOther: true, hasComment: true },
      { id: "6.5a", q: "¿Cómo se gestiona la relación con auditorías y controles oficiales?", type: "checkbox", options: ["Auditorías CAE sin incidencias", "Inspecciones de sanidad sin incidencias", "Ha habido incidencias o no conformidades recientes", "Gestión de auditorías con persona dedicada", "Recae en quien lleva otras tareas", "Se externaliza la preparación"], hasOther: true, hasComment: true },
      { id: "6.6", q: "¿Se han tenido incidencias de devolución de producto en el último año?", type: "radio", options: ["No, prácticamente ninguna", "Puntualmente (< 5 al año)", "Con cierta frecuencia (> 5 al año)", "Es un problema recurrente"], hasComment: true },
      { id: "6.7", q: "¿Podría adaptarse el etiquetado a las necesidades de un cliente conjunto de la red?", type: "radio", options: ["Sí, sin problema", "Sí, pero requeriría inversión o cambios", "Habría que valorarlo", "No se ve viable"] },
    ],
  },
  {
    id: 7,
    title: "Identidad y comunicación",
    icon: "🌐",
    intro: "La red está dando sus primeros pasos. Una de las cuestiones que se ha ido planteando es cómo presentarse hacia fuera y cómo comunicarse entre las agrupaciones.",
    questions: [
      { id: "7.1", q: "¿Resultaría interesante que la red disponga de una imagen colectiva?", type: "radio", options: ["Sí, sería útil para visibilidad y acciones conjuntas", "Sí, pero manteniendo la identidad propia de cada agrupación", "No se ve prioritario ahora"], hasOther: true, hasComment: true },
      { id: "7.2", q: "¿Qué herramientas compartidas serían útiles para la red?", type: "checkbox", options: ["Web pública con presentación de agrupaciones y oferta", "Espacio privado / intranet con información interna", "Catálogo o herramienta comercial conjunta", "Fichas de presentación de cada CAD", "Materiales de comunicación compartidos", "No se ve necesario por ahora"], hasOther: true, hasComment: true },
      { id: "7.3", q: "Para la comunicación interna entre agrupaciones, ¿qué canales funcionarían mejor?", type: "checkbox", options: ["Correo electrónico como canal principal", "Grupo de difusión WhatsApp/Telegram (solo lectura)", "Grupo de conversación WhatsApp/Telegram", "Comunidad con canales temáticos", "Repositorio en Drive bien organizado", "Con el mail es suficiente, no añadir más herramientas"], hasOther: true, hasComment: true },
      { id: "7.4", q: "¿Existe interés en un proceso de acogida o apadrinamiento para nuevas agrupaciones?", type: "radio", options: ["Sí, y habría disposición a apadrinar", "Sí, buena idea aunque no se pueda asumir ahora", "No se ve prioritario"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 8,
    title: "Expectativas y prioridades",
    icon: "🎯",
    intro: "Para terminar, resulta importante conocer qué se espera de este proceso y dónde se pondrían las prioridades. Como se viene planteando desde Valencia: \"hay que cuidar la red para que la red nos cuide\".",
    questions: [
      { id: "8.1", q: "¿Qué se espera que aporte la intercooperación económica?", type: "checkbox", options: ["Complementar la oferta con productos de otros territorios", "Dar salida a excedentes", "Acceder conjuntamente a nuevos canales", "Mejorar eficiencia operativa", "Espacio de apoyo en momentos difíciles", "Fuerza de negociación conjunta", "Horquilla de precios compartida", "Estandarizar procesos y herramientas"], hasOther: true, hasComment: true },
      { id: "8.2", q: "¿Qué se espera que aporte la intercooperación técnica?", type: "checkbox", options: ["Formaciones prácticas sobre temas compartidos", "Intercambio de experiencias entre agrupaciones", "Repositorio de materiales y buenas prácticas", "Asesoramiento adaptado al nivel de madurez", "Conocer cómo trabajan otros CAD (visitas, sesiones)", "Grupos de trabajo con continuidad", "Canal ágil para consultas informales"], hasOther: true, hasComment: true },
      { id: "8.3", q: "¿Qué se espera en materia de gobernanza y participación?", type: "checkbox", options: ["Participar en el Grupo Motor", "Contribuir al Plan Estratégico", "Tener voz sin estar necesariamente en el Grupo Motor", "Información clara y periódica de la actividad de la red", "Participar en formulación de proyectos conjuntos", "Que la red facilite acceso a financiación"], hasOther: true, hasComment: true },
      { id: "8.4", q: "Prioridades para este año por línea de trabajo.", type: "info", description: "En el formulario final se incluirá una matriz: Intercambios entre CAD / Acciones comerciales conjuntas / Formación técnica / Gobernanza / Proyectos conjuntos × Alta / Media / Baja / No es prioridad." },
      { id: "8.5", q: "Capacidad de dedicación real por línea de trabajo.", type: "info", description: "En el formulario final se incluirá una matriz similar a la anterior con niveles de dedicación: Alta / Media / Baja / Nula este año." },
      { id: "8.6", q: "¿Hay interés en participar en el Grupo Motor de la red?", type: "radio", options: ["Sí, hay interés y disponibilidad", "Hay interés pero no tiempo suficiente ahora", "No, pero sí en estar informados"], hasOther: true, hasComment: true },
      { id: "8.7", q: "¿Hay algo más que se quiera compartir?", type: "textarea", optional: true },
    ],
  },
];

function RadioQuestion({ question, value, onChange }) {
  const [otherText, setOtherText] = useState("");
  const [comment, setComment] = useState("");
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: value === opt ? COLORS.sand : "transparent", transition: "background 0.2s" }}>
            <input type="radio" name={question.id} checked={value === opt} onChange={() => onChange(opt)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{opt}</span>
          </label>
        ))}
        {question.hasOther && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", borderRadius: 8, background: value === `otro:${otherText}` ? COLORS.sand : "transparent" }}>
            <input type="radio" name={question.id} checked={value?.startsWith("otro:")} onChange={() => onChange(`otro:${otherText}`)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, color: COLORS.textLight }}>Otro:</span>
              <input type="text" value={otherText} onChange={e => { setOtherText(e.target.value); onChange(`otro:${e.target.value}`); }} placeholder="Especificar..." style={{ display: "block", width: "100%", marginTop: 4, padding: "6px 0", border: "none", borderBottom: `1px solid ${COLORS.border}`, background: "transparent", fontSize: 14, color: COLORS.text, outline: "none" }} />
            </div>
          </label>
        )}
      </div>
      {question.hasComment && (
        <div style={{ marginTop: 12, paddingLeft: 12 }}>
          <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentario opcional..." style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: `1px dashed ${COLORS.border}`, background: "transparent", fontSize: 13, color: COLORS.textLight, outline: "none", fontStyle: "italic" }} />
        </div>
      )}
    </div>
  );
}

function CheckboxQuestion({ question, value = [], onChange }) {
  const [otherText, setOtherText] = useState("");
  const [comment, setComment] = useState("");
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "6px 12px", borderRadius: 8, background: value.includes(opt) ? COLORS.sand : "transparent", transition: "background 0.2s" }}>
            <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{opt}</span>
          </label>
        ))}
        {question.hasOther && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 12px" }}>
            <input type="checkbox" checked={value.some(v => v.startsWith("otro:"))} onChange={() => { const tag = `otro:${otherText}`; toggle(tag); }} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: COLORS.textLight }}>Otro:</span>
              <input type="text" value={otherText} onChange={e => setOtherText(e.target.value)} placeholder="Especificar..." style={{ display: "block", width: "100%", marginTop: 4, padding: "6px 0", border: "none", borderBottom: `1px solid ${COLORS.border}`, background: "transparent", fontSize: 14, color: COLORS.text, outline: "none" }} />
            </div>
          </label>
        )}
      </div>
      {question.hasComment && (
        <div style={{ marginTop: 12, paddingLeft: 12 }}>
          <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentario opcional..." style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: `1px dashed ${COLORS.border}`, background: "transparent", fontSize: 13, color: COLORS.textLight, outline: "none", fontStyle: "italic" }} />
        </div>
      )}
    </div>
  );
}

function TextQuestion({ question, value, onChange }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={question.optional ? "Opcional..." : "Escribe aquí..."} rows={3} style={{ width: "100%", padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.white, fontSize: 14, color: COLORS.text, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border 0.2s" }} onFocus={e => e.target.style.borderColor = COLORS.sage} onBlur={e => e.target.style.borderColor = COLORS.border} />
  );
}

function InfoQuestion({ question }) {
  return (
    <div style={{ padding: 16, background: COLORS.sand, borderRadius: 8, borderLeft: `3px solid ${COLORS.sage}` }}>
      <p style={{ fontSize: 13, color: COLORS.warmGray, margin: 0, lineHeight: 1.6 }}>{question.description}</p>
    </div>
  );
}

function MatrixQuestion({ question, value = {}, onChange }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleSelect = (row, opt) => {
    onChange({ ...value, [row]: opt });
  };

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ minWidth: 500 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 8, marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <div></div>
          {question.options.map((opt, i) => (
            <div key={i} style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 20 }}>{opt.split(" ")[0]}</span>
              <span>{opt.substring(2)}</span>
            </div>
          ))}
        </div>

        {question.rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: i < question.rows.length - 1 ? `1px dashed ${COLORS.border}` : "none" }}>

            <div style={{ fontSize: 14, color: COLORS.text, position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{row}</span>
              {MADUREZ_TOOLTIPS[row] && (
                <div
                  onMouseEnter={() => setActiveTooltip(row)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === row ? null : row)}
                  style={{ cursor: "pointer", color: COLORS.sage }}
                >
                  <HelpCircle size={14} />
                  {activeTooltip === row && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, zIndex: 50, marginTop: 4,
                      background: COLORS.text, color: COLORS.white, padding: "8px 12px",
                      borderRadius: 6, fontSize: 12, lineHeight: 1.4, width: 250,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)", pointerEvents: "none"
                    }}>
                      {MADUREZ_TOOLTIPS[row]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {question.options.map((opt, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="radio"
                  name={`${question.id}-${row}`}
                  checked={value[row] === opt}
                  onChange={() => handleSelect(row, opt)}
                  style={{ width: 18, height: 18, accentColor: COLORS.forest, cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FormularioRedCAD() {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const topRef = useRef(null);

  const block = blocks[currentBlock];
  const progress = ((currentBlock) / blocks.length) * 100;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        loadAnswers(user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadAnswers(session.user.email);
      }
    });

    return () => authListener.subscription?.unsubscribe();
  }, []);

  const loadAnswers = async (email) => {
    const { data } = await supabase
      .from('diagnostic_forms')
      .select('answers')
      .eq('user_email', email)
      .single();

    if (data?.answers) {
      setAnswers(data.answers);
    }
  };

  const saveAnswers = async (currentAnswers) => {
    if (!user) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('diagnostic_forms')
      .select('id')
      .eq('user_email', user.email)
      .single();

    if (existing) {
      await supabase
        .from('diagnostic_forms')
        .update({ answers: currentAnswers })
        .eq('user_email', user.email);
    } else {
      await supabase
        .from('diagnostic_forms')
        .insert([{ user_email: user.email, answers: currentAnswers }]);
    }
    setSaving(false);
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentBlock]);

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleNextBlock = async () => {
    await saveAnswers(answers);
    setCurrentBlock(currentBlock + 1);
  };

  const handleFinalSubmit = async () => {
    await saveAnswers(answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', Georgia, serif" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🌿</div>
          <h2 style={{ fontSize: 24, color: COLORS.forest, marginBottom: 16, fontWeight: 400 }}>Formulario completado</h2>
          <p style={{ fontSize: 15, color: COLORS.warmGray, lineHeight: 1.7 }}>
            Gracias por dedicar este tiempo. Las respuestas ayudarán a construir una red más fuerte y mejor conectada.
          </p>
          <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 24, fontStyle: "italic" }}>
            "Hay que cuidar la red para que la red nos cuide"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Libre Baskerville', Georgia, serif" }}>
      <div ref={topRef} />

      {/* Header */}
      <div style={{ background: COLORS.forest, padding: "20px 24px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: COLORS.sage, textTransform: "uppercase", letterSpacing: 2, fontFamily: "system-ui, sans-serif" }}>Red Estatal de CAD</span>
              <h1 style={{ fontSize: 16, color: COLORS.white, margin: "4px 0 0", fontWeight: 400 }}>Formulario de diagnóstico</h1>
            </div>
            <span style={{ fontSize: 12, color: COLORS.sage, fontFamily: "system-ui, sans-serif" }}>
              {currentBlock + 1} / {blocks.length}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: COLORS.sage, borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>

          {/* Block navigation pills */}
          <div style={{ display: "flex", gap: 4, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
            {blocks.map((b, i) => (
              <button key={i} onClick={() => setCurrentBlock(i)} style={{ flex: "0 0 auto", padding: "4px 10px", borderRadius: 12, border: "none", background: i === currentBlock ? COLORS.sage : "rgba(255,255,255,0.1)", color: i === currentBlock ? COLORS.forest : "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", transition: "all 0.2s", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}>
                {b.icon} {b.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 120px" }}>
        {/* Block intro */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{block.icon}</span>
            <h2 style={{ fontSize: 20, color: COLORS.forest, margin: 0, fontWeight: 400 }}>
              {block.title}
            </h2>
          </div>
          <p style={{ fontSize: 14, color: COLORS.warmGray, lineHeight: 1.7, margin: 0, paddingLeft: 0 }}>
            {block.intro}
          </p>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {block.questions.map((q) => (
            <div key={q.id} style={{ background: COLORS.white, borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: COLORS.sage, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginTop: 2, flexShrink: 0 }}>{q.id}</span>
                <p style={{ fontSize: 15, color: COLORS.text, margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
                  {q.q}
                  {q.optional && <span style={{ fontSize: 12, color: COLORS.textLight, fontStyle: "italic" }}> (opcional)</span>}
                </p>
              </div>

              {q.type === "radio" && <RadioQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
              {q.type === "checkbox" && <CheckboxQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
              {q.type === "textarea" && <TextQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
              {q.type === "info" && <InfoQuestion question={q} />}
              {q.type === "matrix" && <MatrixQuestion question={q} value={answers[q.id] || {}} onChange={v => setAnswer(q.id, v)} />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, padding: "12px 20px", zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => currentBlock > 0 && setCurrentBlock(currentBlock - 1)} disabled={currentBlock === 0} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.white, color: currentBlock === 0 ? COLORS.border : COLORS.warmGray, fontSize: 14, cursor: currentBlock === 0 ? "default" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s" }}>
            ← Anterior
          </button>

          <span style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "system-ui, sans-serif" }}>
            Bloque {currentBlock + 1} de {blocks.length}
          </span>

          {currentBlock < blocks.length - 1 ? (
            <button onClick={handleNextBlock} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: COLORS.forest, color: COLORS.white, fontSize: 14, cursor: saving ? "wait" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s", opacity: saving ? 0.7 : 1 }} onMouseEnter={e => !saving && (e.target.style.background = COLORS.forestLight)} onMouseLeave={e => !saving && (e.target.style.background = COLORS.forest)}>
              {saving ? "Guardando..." : "Siguiente →"}
            </button>
          ) : (
            <button onClick={handleFinalSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, fontSize: 14, cursor: saving ? "wait" : "pointer", fontFamily: "system-ui, sans-serif", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Guardando..." : "Enviar ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
