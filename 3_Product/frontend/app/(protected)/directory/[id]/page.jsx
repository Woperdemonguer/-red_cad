"use client";
import { useEffect, useState } from "react";
import { Users, MapPin, Building, Microscope, Link as LinkIcon, ArrowLeft, LayoutGrid, Wrench, Landmark } from "lucide-react";
import Link from "next/link";
import { profileService } from "@/lib/supabaseService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/** Safely display a value that might be a JS array, a JSON string array, or a plain string */
function displayList(val) {
    if (!val) return null;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string' && val.startsWith('[')) {
        try { return JSON.parse(val).join(', '); } catch { /* fall through */ }
    }
    return val;
}

export default function CadPublicProfile({ params }) {
    const [cad, setCad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const data = await profileService.get(params.id);
                setCad(data);
            } catch (err) {
                setError("No se ha podido cargar este perfil. Puede que no exista o que haya un problema de conexión.");
            }
            setLoading(false);
        }
        fetchProfile();
    }, [params.id]);

    if (loading) return <LoadingSpinner message="Cargando perfil..." />;

    if (!cad && !error) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-border max-w-2xl mx-auto mt-12">
                <Users size={48} className="mx-auto text-border mb-4" />
                <h3 className="text-xl font-medium text-textLight">Perfil no encontrado</h3>
                <Link href="/directory" className="text-accent hover:underline mt-4 inline-block">Volver al Directorio</Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-border max-w-2xl mx-auto mt-12">
                <Users size={48} className="mx-auto text-red mb-4" />
                <h3 className="text-lg font-medium text-text mb-2">Error al cargar perfil</h3>
                <p className="text-textLight mb-6">{error}</p>
                <Link href="/directory" className="text-accent hover:underline">Volver al Directorio</Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Back to Directory */}
            <Link href="/directory" className="inline-flex items-center gap-2 text-textLight hover:text-accent transition-colors font-medium">
                <ArrowLeft size={18} /> Volver al Directorio
            </Link>

            {/* Header Section */}
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-sand/50 border border-border flex items-center justify-center flex-shrink-0 text-5xl font-serif text-forest/30 overflow-hidden shadow-inner">
                    {cad.logo_url ? (
                        <img src={cad.logo_url} alt={cad.nombre_comercial} className="w-full h-full object-cover" />
                    ) : (
                        cad.nombre_comercial?.[0]?.toUpperCase()
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold font-serif text-text mb-4">{cad.nombre_comercial}</h1>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-text font-medium">
                        {cad.territorio && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sage/10 text-forest rounded-full">
                                <MapPin size={16} /> {cad.territorio}
                            </span>
                        )}
                        {cad.forma_juridica && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sand border border-border rounded-full">
                                <Building size={16} /> {displayList(cad.forma_juridica)}
                            </span>
                        )}
                        {cad.num_socios_productoras && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sand border border-border rounded-full">
                                <Users size={16} /> {cad.num_socios_productoras} socias productoras
                            </span>
                        )}
                    </div>

                </div>
            </div>
            {/* Tabs — scrollable on mobile */}
            <div className="flex overflow-x-auto border-b border-border mt-8 -mx-2 px-2 scrollbar-hide">
                {[
                    { id: "general", label: "General", icon: <LayoutGrid size={18} /> },
                    { id: "actividad", label: "Actividad y operaciones", icon: <Wrench size={18} /> },
                    { id: "diagnostico", label: "Intercooperación técnica", icon: <Microscope size={18} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? "border-accent text-accent bg-accent/5" : "border-transparent text-textLight hover:text-text hover:bg-sand/30"}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ────────────────────────────────────────────── */}
            {/* Tab 1: General                                */}
            {/* ────────────────────────────────────────────── */}
            {activeTab === "general" && (
                <div className="space-y-8 mt-8 animate-fade-in">
                    {/* Descripción */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm p-8">
                        <h3 className="text-xl font-bold font-serif text-text mb-4 flex items-center gap-2">
                            <Building size={20} className="text-warmGray" /> Sobre la organización
                        </h3>
                        <p className="text-lg text-text leading-relaxed whitespace-pre-wrap">
                            {cad.descripcion_corta || "Esta agrupación aún no ha proporcionado una descripción."}
                        </p>
                    </div>

                    {/* Datos de identificación — full width grid */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border">
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider flex items-center gap-2">
                                <Building size={16} /> Datos de identificación
                            </h4>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                                {[
                                    { label: "Territorio", value: cad.territorio },
                                    { label: "Forma jurídica", value: displayList(cad.forma_juridica) },
                                    { label: "Año de constitución", value: cad.ano_constitucion },
                                    { label: "Municipio sede", value: cad.datos_adicionales?.municipio_sede },
                                    { label: "Email público", value: cad.email_contacto },
                                    { label: "Teléfono público", value: cad.telefono },
                                ].filter(f => f.value).map((field, i) => (
                                    <div key={i}>
                                        <span className="text-textLight block text-xs uppercase tracking-wider mb-1">{field.label}</span>
                                        <span className="font-medium text-text">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Composición y equipo — full width grid */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border">
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider flex items-center gap-2">
                                <Users size={16} /> Composición y equipo
                            </h4>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                                {[
                                    { label: "Socias productoras", value: cad.num_socios_productoras },
                                    { label: "Socias activas", value: cad.datos_adicionales?.num_socias_activas },
                                    { label: "Personas en plantilla", value: cad.num_personas_trabajadoras },
                                    { label: "Modelo de gobernanza", value: displayList(cad.tipo_gobernanza) },
                                ].filter(f => f.value).map((field, i) => (
                                    <div key={i}>
                                        <span className="text-textLight block text-xs uppercase tracking-wider mb-1">{field.label}</span>
                                        <span className="font-medium text-text">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                            {cad.perfiles_equipo?.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-border">
                                    <span className="text-textLight block text-xs uppercase tracking-wider mb-2">Perfiles del equipo</span>
                                    <div className="flex flex-wrap gap-2">
                                        {cad.perfiles_equipo.map((p, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-sand text-text text-xs font-medium rounded-full border border-border">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* ────────────────────────────────────────────── */}
            {/* Tab 2: Actividad y operaciones                */}
            {/* ────────────────────────────────────────────── */}
            {activeTab === "actividad" && (
                <div className="space-y-8 mt-8 animate-fade-in">
                    {/* Actividades y servicios */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border">
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider flex items-center gap-2">
                                <Wrench size={16} /> Actividades y servicios
                            </h4>
                        </div>
                        <div className="p-6">
                            {cad.datos_adicionales?.actividades_cad?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {cad.datos_adicionales.actividades_cad.map((act, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-sage/10 text-forest text-xs font-medium rounded-full border border-forest/20">{act}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-textLight italic">Información pendiente de completar</p>
                            )}
                            {cad.datos_adicionales?.motivo_creacion && (
                                <div className="mt-5 pt-5 border-t border-border">
                                    <span className="text-textLight block text-xs uppercase tracking-wider mb-1">Motivo de creación</span>
                                    <p className="text-sm text-text italic">&quot;{cad.datos_adicionales.motivo_creacion}&quot;</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modelo de abastecimiento e infraestructuras */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border">
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider flex items-center gap-2">
                                <Landmark size={16} /> Abastecimiento e infraestructuras
                            </h4>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                {[
                                    { label: "Modelo de abastecimiento", value: cad.datos_adicionales?.modelo_abastecimiento },
                                    { label: "Propiedad instalaciones", value: cad.propiedad_instalaciones },
                                    { label: "Superficie", value: cad.datos_adicionales?.superficie_instalaciones },
                                ].filter(f => f.value).map((field, i) => (
                                    <div key={i}>
                                        <span className="text-textLight block text-xs uppercase tracking-wider mb-1">{field.label}</span>
                                        <span className="font-medium text-text">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                            {cad.datos_adicionales?.infraestructuras?.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-border">
                                    <span className="text-textLight block text-xs uppercase tracking-wider mb-2">Activos clave</span>
                                    <div className="flex flex-wrap gap-2">
                                        {cad.datos_adicionales.infraestructuras.map((inf, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-sand text-text text-xs font-medium rounded-full border border-border">{inf}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ────────────────────────────────────────────── */}
            {/* Tab 3: Autodiagnóstico e intercooperación     */}
            {/* ────────────────────────────────────────────── */}
            {activeTab === "diagnostico" && (
                <div className="space-y-8 mt-8 animate-fade-in">
                    {/* Maturity Matrix */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border flex items-center gap-2">
                            <Microscope className="text-warmGray" size={18} />
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider">Autodiagnóstico de madurez técnica</h4>
                        </div>
                        <div className="p-6">
                            <div className="bg-sand/10 rounded-lg border border-border p-4 text-sm divide-y divide-border">
                                {cad.madurez_evaluacion && Object.keys(cad.madurez_evaluacion).length > 0 ? (
                                    Object.entries(cad.madurez_evaluacion).map(([categoria, valor], i) => (
                                        <div key={i} className="flex justify-between py-3 items-center">
                                            <span className="font-medium text-text">{categoria}</span>
                                            <span className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm ${valor.includes("🟢") ? "bg-forest/10 text-forest border border-forest/20" :
                                                valor.includes("🟡") ? "bg-accent/10 text-accent border border-accent/20" :
                                                    valor.includes("🔴") ? "bg-red/10 text-red border border-red/20" : "bg-sand"
                                                }`}>
                                                {valor}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-textLight py-6 italic text-center">Evaluación de madurez pendiente de completar por la agrupación.</p>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-forest uppercase tracking-wider mb-2">Mayores fortalezas</h4>
                                    <p className="text-sm text-text leading-relaxed bg-white p-4 border-l-4 border-forest rounded-r-lg shadow-sm">
                                        {cad.madurez_fortalezas ? `"${cad.madurez_fortalezas}"` : <span className="italic text-textLight">Pendiente de completar</span>}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Mayores retos</h4>
                                    <p className="text-sm text-text leading-relaxed bg-white p-4 border-l-4 border-accent rounded-r-lg shadow-sm">
                                        {cad.madurez_cuellos_botella ? `"${cad.madurez_cuellos_botella}"` : <span className="italic text-textLight">Pendiente de completar</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Intercooperation */}
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-sand/30 border-b border-border flex items-center gap-2">
                            <LinkIcon className="text-warmGray" size={18} />
                            <h4 className="text-sm font-bold text-textLight uppercase tracking-wider">Perfil de intercooperación</h4>
                        </div>
                        <div className="p-6 space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-text mb-3">Capacidad para compartir experiencia en:</h4>
                                {cad.intercoop_compartir?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {cad.intercoop_compartir.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-forest text-white text-xs font-medium rounded-full shadow-sm">{item}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-textLight italic">Información pendiente de completar</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-text mb-3">Buscando apoyo o sinergias en:</h4>
                                {cad.intercoop_apoyo_necesario?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {cad.intercoop_apoyo_necesario.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-accent/20 text-accent border border-accent/20 text-xs font-medium rounded-full shadow-sm">{item}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-textLight italic">Información pendiente de completar</p>
                                )}
                            </div>

                            <div className="bg-sage/10 p-4 rounded-lg border border-forest/20">
                                <p className="text-sm text-forest mb-2"><span className="font-bold">Disposición a red:</span> {cad.intercoop_disposicion || <span className="italic font-normal">Pendiente</span>}</p>
                                <p className="text-sm text-forest"><span className="font-bold">Contactos técnicos:</span> {cad.intercoop_referentes || <span className="italic font-normal">Pendiente</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
