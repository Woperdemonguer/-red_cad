import { useState, useEffect, useRef } from "react";

const C = {
  gold: "#EBA615",
  goldSoft: "#F5CC5E",
  goldBg: "#FFFCF3",
  goldBorder: "#F5E6BE",
  white: "#FFFFFF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#2D3748",
  textSoft: "#64748B",
  textMuted: "#94A3B8",
  border: "#E8E5E0",
  borderLight: "#F1EFEB",
  selected: "#FFFBF0",
  selectedBorder: "#EBA615",
};

const blocks = [
  {
    id: 0, title: "Validación ficha", icon: "📋", intro: "Se ha preparado desde la red una ficha con los datos básicos de cada agrupación. Se invita a revisarla e indicar si hay algo que actualizar.",
    questions: [
      { id: "0.1", q: "¿Los datos de la ficha enviada son correctos?", type: "radio", options: ["Sí, todo correcto", "No, hay datos que actualizar"] },
      { id: "0.2", q: "Si hay datos que actualizar, indicar cuáles.", type: "textarea", conditional: true },
      { id: "0.3", q: "Persona de contacto principal para intercooperación económica.", type: "textarea" },
      { id: "0.4", q: "¿Hay una segunda persona de contacto?", type: "textarea", optional: true },
    ],
  },
  {
    id: 1, title: "Gobernanza interna", icon: "🤝", intro: "Resulta importante entender cómo se organiza y toma decisiones cada agrupación. No hay modelos mejores ni peores; se trata de conocer esta diversidad.",
    questions: [
      { id: "1.1", q: "¿Cómo se toman las decisiones comerciales en el CAD?", type: "radio", options: ["El equipo técnico/gerencia tiene autonomía", "Pasan por una comisión o grupo de trabajo", "Requieren aprobación de la junta/asamblea", "No hay un proceso definido"], hasOther: true },
      { id: "1.2", q: "¿Quién coordina actualmente la oferta y la relación con clientes?", type: "radio", options: ["Equipo técnico / personal contratado", "Comisión comercial de socias", "Junta directiva o coordinación general", "Liderazgos informales", "No hay nadie con esa función clara"], hasOther: true },
      { id: "1.3", q: "¿Se ha tratado internamente el tema de comprar o vender producto a otros CAD?", type: "radio", options: ["Sí, hay respaldo claro", "Sí, pero hay dudas o resistencias", "No se ha planteado formalmente", "No aplica, lo decide el equipo técnico"] },
      { id: "1.4", q: "Si hay dudas o resistencias internas, ¿cuáles son?", type: "textarea", optional: true },
      { id: "1.5", q: "¿Cómo se describiría la relación entre equipo técnico y base social productora?", type: "radio", options: ["Fuerte: confianza y participación activa", "Funcional: delegación funciona, participación limitada", "Frágil: tensiones o desconexión", "No aplica: las productoras gestionan el CAD"], hasOther: true },
      { id: "1.6", q: "¿Existe algún servicio o rol externalizado clave?", type: "textarea", optional: true },
    ],
  },
  {
    id: 2, title: "Modelo de negocio", icon: "📊", intro: "Como red es importante tener una imagen clara de dónde está cada agrupación. Esta información se trata con confidencialidad.",
    questions: [
      { id: "2.1", q: "Volumen aproximado de facturación anual.", type: "radio", options: ["< 50.000 €", "50.000 – 150.000 €", "150.000 – 300.000 €", "300.000 – 600.000 €", "600.000 – 1M €", "1M – 1,5M €", "> 1,5M €", "Se prefiere no compartir"], hasComment: true },
      { id: "2.2", q: "Evolución de la facturación en los últimos 3 años.", type: "radio", options: ["Crecimiento sostenido (>10%)", "Crecimiento moderado (<10%)", "Estable", "Irregular", "Descenso", "Sin histórico", "Se prefiere no compartir"], hasOther: true },
      { id: "2.3", q: "¿El CAD genera resultado positivo?", type: "radio", options: ["Sí, consolidado", "Equilibrio", "Negativo pero previsto", "Negativo y complicado", "Sin cierre definitivo", "Se prefiere no compartir"], hasOther: true, hasComment: true },
      { id: "2.4", q: "Distribución de facturación por canal.", type: "info", description: "En el formulario final se incluirá una matriz interactiva de canales × porcentajes." },
      { id: "2.5", q: "¿Cómo de concentrada está la cartera de clientes?", type: "radio", options: ["Diversificada (top 3 < 25%)", "Moderada (25-50%)", "Concentrada (> 50%)"], hasComment: true },
      { id: "2.6", q: "¿Experiencia con contratos de suministro estables?", type: "radio", options: ["Sí, es habitual", "Sí, con algunos clientes", "No, pero interesaría", "No, y no se ve viable", "Se ha tenido, pero ya no"], hasOther: true },
      { id: "2.7", q: "Estacionalidad de la facturación.", type: "radio", options: ["Alta (picos y valles)", "Moderada con picos claros", "Regular pero dependiente de algún canal", "Baja (regular todo el año)", "Variable según producto"], hasOther: true, hasComment: true },
      { id: "2.8", q: "Política de márgenes comerciales.", type: "radio", options: ["Margen fijo para todos los productos", "Diferenciado por producto y/o canal", "Sin política establecida"], hasOther: true, hasComment: true },
      { id: "2.9", q: "Herramientas de seguimiento económico disponibles.", type: "checkbox", options: ["Software (POD, ERP u otro)", "Control de márgenes", "Control costes logísticos", "Costes de producción", "Contabilidad analítica", "Presupuesto/plan viabilidad", "Cuadro de mando", "Excel propias", "Asesoría externa", "Sin herramientas específicas"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 3, title: "Capacidad operativa", icon: "⚙️", intro: "Recursos, infraestructura y organización disponibles hoy para participar en intercambios.",
    questions: [
      { id: "3.1", q: "¿Se realiza planificación productiva o coordinación de oferta?", type: "radio", options: ["Sí, de forma regular", "Solo para determinados productos", "Coordinación informal", "No existe coordinación"], hasOther: true, hasComment: true },
      { id: "3.2", q: "¿Cómo se recoge la disponibilidad de producto?", type: "radio", options: ["Formato estructurado (catálogo, ERP, POD)", "Mensajería y recopilación manual", "Llamadas o correos puntuales", "Cada socia gestiona por su cuenta", "En diseño"], hasOther: true },
      { id: "3.3", q: "¿Se podría consolidar y servir un pedido conjunto?", type: "radio", options: ["Sí, con facilidad", "Sí, con esfuerzo", "Difícil hoy", "No es función del CAD"], hasOther: true, hasComment: true },
      { id: "3.4", q: "Modelo de abastecimiento predominante.", type: "radio", options: ["Solo producción de socias", "Socias + externos estables", "Socias + externos según necesidad", "Mayoritariamente externas"], hasOther: true },
      { id: "3.5", q: "Alcance habitual de distribución.", type: "checkbox", options: ["Local / comarcal", "Provincial", "Autonómico", "Interautonómico", "Estatal"], hasOther: true, hasComment: true },
      { id: "3.5a", q: "¿El alcance varía según tipo de producto?", type: "radio", options: ["No, similar para todos", "Sí, fresco más reducido", "Sí, varía significativamente"], hasOther: true, hasComment: true },
      { id: "3.6", q: "¿Flota logística propia?", type: "radio", options: ["Íntegramente propia", "Mixta", "Subcontratada", "No se distribuye"], hasOther: true, hasComment: true },
      { id: "3.7", q: "Capacidad de almacenamiento en frío.", type: "radio", options: ["Sin frío", "Pequeña (< 100 m²)", "Media (100-300 m²)", "Alta (> 300 m²)"], hasOther: true, hasComment: true },
      { id: "3.8", q: "Software de gestión actual.", type: "checkbox", options: ["POD", "Otro ERP", "Excel", "Sin software específico"], hasOther: true, hasComment: true },
      { id: "3.8a", q: "¿Funciona o podría funcionar como centro de acopio?", type: "radio", options: ["Ya funciona para las socias", "Podría ser punto intermedio para la red", "Hay infraestructura pero no se usa así", "No hay capacidad"], hasOther: true, hasComment: true },
      { id: "3.8b", q: "Tiempo de respuesta habitual para un pedido.", type: "radio", options: ["24h", "48h", "72h", "1 semana+", "Variable"], hasOther: true, hasComment: true },
      { id: "3.9", q: "Principales dificultades para coordinar oferta.", type: "checkbox", options: ["Falta de tiempo", "Falta de herramienta común", "Producciones diversas", "Estacionalidad", "Diferencias de precios", "Logística", "Falta de liderazgo", "Falta infraestructuras", "Limitaciones digitales", "Conectividad", "Perfil de edad", "Personal técnico escaso"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 4, title: "Madurez e intercoop técnica", icon: "🔬", intro: "Cada agrupación tiene fortalezas y necesidades diferentes. Situarse de forma honesta permite que la red organice mejor sus recursos.",
    questions: [
      { id: "4.1", q: "Autoevaluación de madurez por ámbitos.", type: "info", description: "Matriz semáforo (🔴 necesita apoyo / 🟡 en desarrollo / 🟢 consolidado): Planificación productiva · Gestión comercial · Costes de producción · Logística · Calidad · Digitalización · Gobernanza · Marketing · Administración · Restauración colectiva." },
      { id: "4.2", q: "¿En qué ámbitos se podría compartir experiencia?", type: "checkbox", options: ["Planificación productiva", "Gestión comercial", "Costes de producción", "Logística", "Calidad y trazabilidad", "Digitalización", "Gobernanza", "Marketing", "Administración", "Restauración colectiva"], hasOther: true, hasComment: true },
      { id: "4.3", q: "¿En qué ámbitos se necesitaría más apoyo?", type: "checkbox", options: ["Planificación productiva", "Gestión comercial", "Costes de producción", "Logística", "Calidad y trazabilidad", "Digitalización", "Gobernanza", "Marketing", "Administración", "Restauración colectiva"], hasOther: true, hasComment: true },
      { id: "4.4", q: "¿Disposición a participar en espacios de intercoop técnica?", type: "radio", options: ["Sí, aportando y recibiendo", "Sí, como participante", "Interesa pero poca disponibilidad", "No prioritario ahora"], hasOther: true, hasComment: true },
      { id: "4.5", q: "¿Hay alguna persona referente o embajadora en algún tema?", type: "textarea", optional: true },
    ],
  },
  {
    id: 5, title: "Oferta y necesidades", icon: "🌱", intro: "Grandes líneas de oferta y necesidades. El detalle fino se trabajará con los datos de los sistemas de gestión.",
    questions: [
      { id: "5.1", q: "Familias de producto que puede ofrecer el CAD.", type: "checkbox", options: ["Huerta", "Fruta", "Cítricos", "Frutos secos", "Aceite", "Vino", "Cereales/legumbres", "Carne", "Lácteos", "Huevos", "Apicultura", "Transformados", "Panadería", "Bebidas"], hasOther: true },
      { id: "5.2", q: "¿Existen excedentes o picos recurrentes?", type: "radio", options: ["Sí, estructurales", "Sí, estacionales", "No"] },
      { id: "5.3", q: "Si existen, ¿en qué categorías y época?", type: "textarea", optional: true },
      { id: "5.4", q: "¿Se necesita abastecer regularmente de producto externo?", type: "radio", options: ["Sí, estructuralmente", "Sí, estacionalmente", "Puntualmente", "No, casi todo de socias"], hasOther: true },
      { id: "5.5", q: "Categorías que se necesita adquirir externamente.", type: "checkbox", options: ["Huerta", "Fruta", "Cítricos", "Frutos secos", "Aceite", "Cereales/legumbres", "Carne", "Lácteos", "Transformados", "Panadería", "Bebidas"], hasOther: true },
      { id: "5.6", q: "¿Disposición a ofrecer producto a otros CAD?", type: "radio", options: ["Sí, ya se hace o se quiere", "Sí, con condiciones mínimas", "No hay capacidad de oferta, pero sí de facilitar mercado", "Interesa pero hay que madurar", "No se ve viable"], hasOther: true, hasComment: true },
      { id: "5.7", q: "¿Disposición a sustituir compras externas por compras a otros CAD?", type: "radio", options: ["Sí, si condiciones competitivas", "Sí, priorizando proveedores locales", "Habría que valorarlo", "No se ve viable"] },
      { id: "5.8", q: "¿Se intercambia ya producto con algún otro CAD?", type: "textarea", optional: true },
    ],
  },
  {
    id: 6, title: "Calidad", icon: "✅", intro: "Capacidad de calidad y servicio a nivel de red para abordar conjuntamente nuevos canales.",
    questions: [
      { id: "6.1", q: "¿Fichas técnicas de los productos?", type: "radio", options: ["Sí, para todos o mayoría", "Solo algunos", "En proceso", "No"], hasOther: true, hasComment: true },
      { id: "6.2", q: "¿Política o protocolo de calidad?", type: "radio", options: ["Protocolo escrito con responsable", "Criterios no formalizados", "Caso a caso", "No"], hasOther: true, hasComment: true },
      { id: "6.3", q: "¿Revisión de producto antes de salir al cliente?", type: "radio", options: ["Sí, con criterios definidos", "Sí, visual/informal", "Solo algunos clientes", "No, directo al cliente"], hasOther: true, hasComment: true },
      { id: "6.4", q: "Certificaciones adicionales a ecológica.", type: "checkbox", options: ["GlobalGAP", "Demeter", "Comercio justo", "Residuo cero", "ISO/AENOR", "BRC/IFS", "Ninguna"], hasOther: true },
      { id: "6.5", q: "Situación en trazabilidad.", type: "radio", options: ["Completa para todo", "Completa mayoría", "Lo que exigen auditorías", "Parcial", "Sin sistema"], hasOther: true, hasComment: true },
      { id: "6.5a", q: "Relación con auditorías y controles.", type: "checkbox", options: ["CAE sin incidencias", "Sanidad sin incidencias", "Incidencias recientes", "Persona dedicada", "Recae en multitarea", "Se externaliza"], hasOther: true, hasComment: true },
      { id: "6.6", q: "Incidencias de devolución (último año).", type: "radio", options: ["Prácticamente ninguna", "Puntuales (< 5)", "Frecuentes (> 5)", "Problema recurrente"], hasComment: true },
      { id: "6.7", q: "¿Podría adaptarse el etiquetado para un cliente conjunto?", type: "radio", options: ["Sí, sin problema", "Sí, con inversión", "Habría que valorarlo", "No viable"] },
    ],
  },
  {
    id: 7, title: "Identidad y comunicación", icon: "🌐", intro: "Cómo presentarse hacia fuera y comunicarse entre las agrupaciones de la red.",
    questions: [
      { id: "7.1", q: "¿Interesaría una imagen colectiva de la red?", type: "radio", options: ["Sí, para visibilidad", "Sí, manteniendo identidad propia", "No prioritario ahora"], hasOther: true, hasComment: true },
      { id: "7.2", q: "Herramientas compartidas útiles.", type: "checkbox", options: ["Web pública", "Intranet interna", "Catálogo comercial conjunto", "Fichas de cada CAD", "Materiales comunicación", "No necesario"], hasOther: true, hasComment: true },
      { id: "7.3", q: "Canales de comunicación interna.", type: "checkbox", options: ["Correo electrónico", "Difusión WhatsApp/Telegram", "Grupo conversación", "Comunidad con canales", "Drive organizado", "Solo mail"], hasOther: true, hasComment: true },
      { id: "7.4", q: "¿Interés en acogida/apadrinamiento para nuevas agrupaciones?", type: "radio", options: ["Sí, y disposición a apadrinar", "Buena idea, pero no ahora", "No prioritario"], hasOther: true, hasComment: true },
    ],
  },
  {
    id: 8, title: "Expectativas", icon: "🎯", intro: "\"Hay que cuidar la red para que la red nos cuide.\"",
    questions: [
      { id: "8.1", q: "¿Qué se espera de la intercooperación económica?", type: "checkbox", options: ["Complementar oferta", "Salida a excedentes", "Nuevos canales conjuntos", "Eficiencia operativa", "Apoyo en momentos difíciles", "Negociación conjunta", "Horquilla de precios", "Estandarizar procesos"], hasOther: true, hasComment: true },
      { id: "8.2", q: "¿Qué se espera de la intercooperación técnica?", type: "checkbox", options: ["Formaciones prácticas", "Intercambio experiencias", "Repositorio materiales", "Asesoramiento adaptado", "Conocer otros CAD", "Grupos de trabajo", "Canal consultas informales"], hasOther: true, hasComment: true },
      { id: "8.3", q: "¿Qué se espera en gobernanza?", type: "checkbox", options: ["Participar en Grupo Motor", "Plan Estratégico", "Tener voz", "Información periódica", "Proyectos conjuntos", "Acceso a financiación"], hasOther: true, hasComment: true },
      { id: "8.4", q: "Prioridades por línea de trabajo.", type: "info", description: "Matriz: Intercambios / Comercial conjunto / Formación / Gobernanza / Proyectos × Alta / Media / Baja / No prioridad." },
      { id: "8.5", q: "Capacidad de dedicación por línea.", type: "info", description: "Matriz similar: Alta / Media / Baja / Nula." },
      { id: "8.6", q: "¿Interés en el Grupo Motor?", type: "radio", options: ["Sí, con disponibilidad", "Interés pero sin tiempo", "No, pero sí informados"], hasOther: true, hasComment: true },
      { id: "8.7", q: "¿Algo más que compartir?", type: "textarea", optional: true },
    ],
  },
];

function Field({ question, value, onChange }) {
  const [otherText, setOtherText] = useState("");
  const [comment, setComment] = useState("");

  if (question.type === "info") return (
    <div style={{ padding: "16px 20px", background: C.goldBg, borderRadius: 12, border: `1px solid ${C.goldBorder}` }}>
      <p style={{ fontSize: 13, color: C.textSoft, margin: 0, lineHeight: 1.7 }}>{question.description}</p>
    </div>
  );

  if (question.type === "textarea") return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={question.optional ? "Opcional..." : "Escribe aquí..."} rows={3} style={{ width: "100%", padding: 14, border: `1.5px solid ${C.borderLight}`, borderRadius: 12, background: C.white, fontSize: 14, color: C.text, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.2s" }} onFocus={e => e.target.style.borderColor = C.goldSoft} onBlur={e => e.target.style.borderColor = C.borderLight} />
  );

  const isCb = question.type === "checkbox";
  const val = isCb ? (value || []) : value;
  const toggle = (opt) => { const a = val; onChange(a.includes(opt) ? a.filter(v => v !== opt) : [...a, opt]); };
  const isSelected = (opt) => isCb ? val.includes(opt) : val === opt;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 16px", borderRadius: 10, background: isSelected(opt) ? C.selected : C.white, border: `1.5px solid ${isSelected(opt) ? C.selectedBorder : C.borderLight}`, transition: "all 0.2s" }}>
            <div style={{ width: 20, height: 20, borderRadius: isCb ? 5 : 10, border: `2px solid ${isSelected(opt) ? C.gold : C.border}`, background: isSelected(opt) ? C.gold : C.white, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
              {isSelected(opt) && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <input type={isCb ? "checkbox" : "radio"} name={question.id} checked={isSelected(opt)} onChange={() => isCb ? toggle(opt) : onChange(opt)} style={{ display: "none" }} />
            <span style={{ fontSize: 14, color: C.text, lineHeight: 1.45 }}>{opt}</span>
          </label>
        ))}
        {question.hasOther && (
          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${C.borderLight}`, background: C.white }}>
            <div style={{ width: 20, height: 20, borderRadius: isCb ? 5 : 10, border: `2px solid ${C.border}`, background: C.white, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input type="text" value={otherText} onChange={e => { setOtherText(e.target.value); const t = `otro:${e.target.value}`; if (!isCb) onChange(t); }} placeholder="Otro..." style={{ width: "100%", padding: 0, border: "none", background: "transparent", fontSize: 14, color: C.text, outline: "none" }} />
            </div>
          </label>
        )}
      </div>
      {question.hasComment && (
        <div style={{ marginTop: 12 }}>
          <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="💬  Comentario opcional..." style={{ width: "100%", padding: "10px 14px", border: `1px dashed ${C.borderLight}`, borderRadius: 10, background: C.bg, fontSize: 13, color: C.textMuted, outline: "none", boxSizing: "border-box" }} onFocus={e => { e.target.style.borderColor = C.goldSoft; e.target.style.color = C.textSoft; }} onBlur={e => { e.target.style.borderColor = C.borderLight; if (!e.target.value) e.target.style.color = C.textMuted; }} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const topRef = useRef(null);
  const block = blocks[cur];

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cur]);

  if (done) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 8px 24px rgba(235,166,21,0.25)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontSize: 24, color: C.text, marginBottom: 12, fontWeight: 700 }}>Formulario completado</h2>
        <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.7 }}>Gracias por dedicar este tiempo. Las respuestas ayudarán a construir una red más fuerte y mejor conectada.</p>
        <p style={{ fontSize: 14, color: C.gold, marginTop: 24, fontWeight: 600, fontStyle: "italic" }}>"Hay que cuidar la red para que la red nos cuide"</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div ref={topRef} />

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.borderLight}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: 0.5 }}>GIASAT</span>
              <span style={{ color: C.textMuted, fontSize: 12 }}>· Red de CAD</span>
            </div>
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{cur + 1} de {blocks.length}</span>
          </div>

          {/* Progress */}
          <div style={{ height: 4, background: C.borderLight, borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${((cur + 1) / blocks.length) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldSoft})`, borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto", paddingBottom: 2 }}>
            {blocks.map((b, i) => (
              <button key={i} onClick={() => setCur(i)} style={{ flex: "0 0 auto", padding: "5px 12px", borderRadius: 20, border: "none", background: i === cur ? C.goldBg : "transparent", color: i === cur ? C.gold : C.textMuted, fontSize: 12, cursor: "pointer", fontWeight: i === cur ? 600 : 400, transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {b.icon} {b.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 130px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 32 }}>{block.icon}</span>
            <div>
              <h2 style={{ fontSize: 22, color: C.text, margin: 0, fontWeight: 700 }}>{block.title}</h2>
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>{block.intro}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {block.questions.map((q) => (
            <div key={q.id} style={{ background: C.card, borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.borderLight}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginTop: 2, flexShrink: 0, background: C.goldBg, padding: "2px 6px", borderRadius: 4 }}>{q.id}</span>
                <p style={{ fontSize: 15, color: C.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  {q.q}
                  {q.optional && <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 400 }}> (opcional)</span>}
                </p>
              </div>
              <Field question={q} value={answers[q.id]} onChange={v => setAnswers(p => ({ ...p, [q.id]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.borderLight}`, padding: "12px 16px", zIndex: 10 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => cur > 0 && setCur(cur - 1)} disabled={cur === 0} style={{ padding: "10px 20px", borderRadius: 12, border: `1.5px solid ${cur === 0 ? C.borderLight : C.border}`, background: C.white, color: cur === 0 ? C.textMuted : C.text, fontSize: 14, cursor: cur === 0 ? "default" : "pointer", fontWeight: 500, transition: "all 0.2s" }}>
            ← Anterior
          </button>
          <span style={{ fontSize: 11, color: C.textMuted }}>Bloque {cur + 1} de {blocks.length}</span>
          {cur < blocks.length - 1 ? (
            <button onClick={() => setCur(cur + 1)} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.text, color: C.white, fontSize: 14, cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }} onMouseEnter={e => e.target.style.background = "#1a2332"} onMouseLeave={e => e.target.style.background = C.text}>
              Siguiente →
            </button>
          ) : (
            <button onClick={() => setDone(true)} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, color: C.white, fontSize: 14, cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(235,166,21,0.3)" }}>
              Enviar ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
