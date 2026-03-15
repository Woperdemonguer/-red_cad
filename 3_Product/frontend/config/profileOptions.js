// ─── Perfiles de equipo (usado en el perfil) ───
export const PERFILES_EQUIPO_OPTIONS = [
    "Gerencia / Coordinación / Dirección",
    "Técnica comercial y gestión de cartera de clientes",
    "Técnico/a de producción y seguimiento en campo",
    "Técnico/a de almacén (control de calidad, coordinación logística)",
    "Técnico/a de gestión de pedidos",
    "Dinamización de la gobernanza social del CAD",
    "Administración y gestión interna"
];

// ─── Autoevaluación de madurez técnica (11 ámbitos v2.0) ───
export const MADUREZ_CATEGORIAS = [
    "Planificación productiva",
    "Gestión comercial",
    "Costes de producción",
    "Logística",
    "Calidad",
    "Digitalización",
    "Gobernanza interna",
    "Marketing",
    "Administración",
    "Restauración colectiva",
    "Sistemas de indicadores, medición y evaluación"
];

export const MADUREZ_TOOLTIPS = {
    "Planificación productiva": "Capacidad para coordinar los cultivos de la base social con antelación, basándose en la demanda esperada para evitar excedentes o faltas de producto.",
    "Gestión comercial": "Capacidad para buscar proactivamente nuevos clientes, fijar precios rentables y mantener una relación fluida con los canales de venta.",
    "Costes de producción": "Capacidad de calcular y hacer un seguimiento real de cuánto cuesta producir y distribuir cada producto para garantizar la viabilidad.",
    "Logística": "Eficiencia en la recogida, almacenamiento (en frío o en seco), preparación de pedidos y distribución física al cliente final o punto intermedio.",
    "Calidad": "Estandarización de calibres, maduración, presentación del producto, y protocolos de revisión y gestión de mermas e incidencias.",
    "Digitalización": "Uso sistemático de herramientas digitales (ERP, POD, etc.) para la gestión integral, trazabilidad, facturación y catálogo de productos.",
    "Gobernanza interna": "Claridad en los procesos de toma de decisiones, roles asignados y nivel de participación democrática y cohesión de la base social.",
    "Marketing": "Generación de una identidad clara, materiales comerciales y presencia (digital o física) para poner en valor el proyecto y sus productos.",
    "Administración": "Solidez y orden en la contabilidad, fiscalidad, facturación, cobros/pagos y trámites burocráticos.",
    "Restauración colectiva": "Experiencia y capacidad para servir a colegios, hospitales u otros comedores públicos/privados de forma constante.",
    "Sistemas de indicadores, medición y evaluación": "Uso de indicadores o herramientas para medir resultados, evaluar el desempeño del CAD y tomar decisiones basadas en datos."
};

// ─── Intercooperación ───
export const AMBITOS_INTERCOOP = [
    "Planificación productiva", "Gestión comercial", "Costes de producción",
    "Logística y distribución", "Calidad y trazabilidad", "Digitalización",
    "Gobernanza interna", "Marketing y comunicación", "Gestión administrativa",
    "Restauración colectiva y compra pública",
    "Sistemas de indicadores, medición y evaluación"
];

export const INTERCOOP_TOOLTIPS = {
    "Planificación productiva": "Coordinación anticipada basada en demanda.",
    "Gestión comercial": "Búsqueda de clientes, precios y relación con canales.",
    "Costes de producción": "Cálculo y seguimiento para viabilidad.",
    "Logística y distribución": "Recogida, almacenamiento, preparación y envío.",
    "Calidad y trazabilidad": "Estandarización y protocolos de revisión/mermas.",
    "Digitalización": "Uso de ERP, POD, facturación y catálogo.",
    "Gobernanza interna": "Toma de decisiones, participación y base social.",
    "Marketing y comunicación": "Identidad, materiales y presencia.",
    "Gestión administrativa": "Contabilidad, fiscalidad y burocracia.",
    "Restauración colectiva y compra pública": "Experiencia escolar, hospitalaria y pública.",
    "Sistemas de indicadores, medición y evaluación": "Herramientas de medición y mejora continua."
};

// ─── Opciones para secciones expandidas del perfil (v2.0) ───

export const ACTIVIDADES_CAD_OPTIONS = [
    "Planificación de producción, seguimiento en campo y calidad",
    "Comercialización conjunta (búsqueda activa de clientes)",
    "Gestión de pedidos y preparación agregada en almacén (picking)",
    "Servicio de logística, diseño de rutas y distribución",
    "Servicio de almacenamiento de producto en centro logístico",
    "Centro de acopio donde las socias complementan productos para sus otros canales",
    "Transformación de productos a maquila",
    "Transformación de productos y comercialización bajo marca del CAD",
    "Compra de insumos y materiales de forma conjunta para socias",
    "Servicios de cosecha en campo",
    "Servicios de plantado en campo",
    "Servicios de administración y aspectos burocráticos",
    "Formación y capacitación productiva individual y en conjunto",
    "Acompañamiento en la presentación de subvenciones o ayudas"
];

export const INFRAESTRUCTURAS_OPTIONS = [
    "Almacén propio (en propiedad o alquiler)",
    "Cámaras frigoríficas",
    "Vehículos propios para distribución de pedidos",
    "Obrador / salas de manipulado",
    "Espacio de venta propio (tienda)",
    "Software / herramienta de gestión",
    "Maquinaria específica (calibradoras, cepilladoras, envasadoras, etc.)"
];

export const MODELO_ABASTECIMIENTO_OPTIONS = [
    "Solo producción de socias",
    "Producción de socias + compras externas complementarias con proveedores estables y de confianza",
    "Producción de socias + compras externas complementarias en el mercado según necesidad",
    "Mayoritariamente compras externas"
];

export const DOCUMENTOS_GOBERNANZA_OPTIONS = [
    "Estatutos",
    "Régimen de Funcionamiento Interno (RFI)"
];

export const PROTOCOLOS_OPTIONS = [
    "Guía o protocolo de calidad",
    "Protocolos comerciales",
    "Protocolos de incorporación de nuevas personas socias",
    "Protocolos logísticos o de funcionamiento de almacén",
    "Protocolos de relación con clientes"
];

export const SUPERFICIE_OPTIONS = [
    "Menos de 200 m²",
    "200–500 m²",
    "500–1.000 m²",
    "1.000–3.000 m²",
    "Más de 3.000 m²"
];

export const CCAA_OPTIONS = [
    "Andalucía", "Aragón", "Principado de Asturias", "Illes Balears",
    "Canarias", "Cantabria", "Castilla y León", "Castilla-La Mancha",
    "Cataluña", "Comunitat Valenciana", "Extremadura", "Galicia",
    "Comunidad de Madrid", "Región de Murcia", "Comunidad Foral de Navarra",
    "País Vasco", "La Rioja", "Actuación en varias CCAA"
];

export const FORMA_JURIDICA_OPTIONS = [
    "SAT",
    "Cooperativa de primer grado",
    "Cooperativa de segundo grado",
    "Asociación",
    "Sociedad Limitada (SL)"
];

export const TIPO_GOBERNANZA_OPTIONS = [
    "Órganos de Gobierno (Asamblea y Junta Directiva) y un equipo técnico",
    "Órganos de Gobierno + Equipo Técnico + Grupos de trabajo u otros espacios estables",
    "Órganos de Gobierno + Equipo Técnico + Grupos de trabajo regulados por estatutos o RFI",
    "Órganos de Gobierno con secciones cooperativas con caja separada"
];

export const CRITERIOS_COMPRAS_OPTIONS = [
    "Sí, hay mecanismos acordados para priorizar a determinados proveedores",
    "Sí, hay un porcentaje máximo de compras externas sobre el total de ventas",
    "Hay criterios informales pero no están formalizados",
    "No, se decide caso a caso"
];
