"use client";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Save, UserCircle, Building, Link as LinkIcon, AlertCircle, Microscope, Users, UploadCloud, HelpCircle, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileService, teamService, storageService } from "@/lib/supabaseService";
import TeamMemberList from "@/components/TeamMemberList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { 
    PERFILES_EQUIPO_OPTIONS, 
    MADUREZ_CATEGORIAS, 
    MADUREZ_TOOLTIPS, 
    AMBITOS_INTERCOOP, 
    INTERCOOP_TOOLTIPS 
} from "@/config/profileOptions";

function ProfileForm() {
    const { isAdmin: authIsAdmin, cadId: authCadId, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const targetCadId = searchParams.get("cad_id");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [activeTooltip, setActiveTooltip] = useState(null);

    const [profileData, setProfileData] = useState({
        nombre_comercial: "",
        descripcion_corta: "",
        territorio: "",
        email_contacto: "",
        telefono: "",
        ano_constitucion: "",
        num_socios_productoras: "",
        num_personas_trabajadoras: "",
        forma_juridica: "",
        tipo_gobernanza: "",
        madurez_evaluacion: {},
        madurez_fortalezas: "",
        madurez_cuellos_botella: "",
        intercoop_compartir: [],
        intercoop_apoyo_necesario: [],
        intercoop_disposicion: "",
        intercoop_referentes: "",
        logo_url: "",
        estado: "Activo",
        grupo_motor: "No",
        perfiles_equipo: [],
        propiedad_instalaciones: ""
    });

    const [teamMembers, setTeamMembers] = useState([]);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const initialProfileRef = useRef(null);

    // Auto-clear success message after 4 seconds
    useEffect(() => {
        if (!successMsg) return;
        const timer = setTimeout(() => setSuccessMsg(""), 4000);
        return () => clearTimeout(timer);
    }, [successMsg]);

    // Warn on unsaved changes
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // Derived state: is admin viewing their own team management page (no CAD context)
    const isAdminView = authIsAdmin && !targetCadId && !authCadId;

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;

        async function loadProfile() {
            try {
                // Determine which CAD to load
                let queryCadId = null;

                if (targetCadId) {
                    if (!authIsAdmin) {
                        setErrorMsg("No tienes permisos para editar otros perfiles.");
                        setLoading(false); return;
                    }
                    queryCadId = targetCadId;
                } else {
                    queryCadId = authCadId; // From useAuth — already resolved
                }

                // Admin with no CAD → show admin team management
                if (!queryCadId && authIsAdmin) {
                    const team = await teamService.listAdmins();
                    if (cancelled) return;
                    setTeamMembers(team);
                    setLoading(false);
                    return;
                }

                if (!queryCadId) {
                    setErrorMsg("No se ha podido localizar tu Centro asociado.");
                    setLoading(false); return;
                }

                // Load profile and team in parallel
                const [profile, team] = await Promise.all([
                    profileService.get(queryCadId),
                    teamService.listForCad(queryCadId),
                ]);

                if (cancelled) return;

                if (profile) {
                    setProfileData({
                        ...profile,
                        madurez_evaluacion: profile.madurez_evaluacion || {},
                        intercoop_compartir: profile.intercoop_compartir || [],
                        intercoop_apoyo_necesario: profile.intercoop_apoyo_necesario || [],
                        perfiles_equipo: profile.perfiles_equipo || [],
                    });
                }
                setTeamMembers(team);
            } catch (err) {
                if (cancelled) return;
                setErrorMsg(err.message);
            }
            setLoading(false);
        }

        loadProfile();
        return () => { cancelled = true; };
    }, [authLoading, authIsAdmin, authCadId, targetCadId]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
        setIsDirty(true);
    };

    const handleMatrixChange = (categoria, valor) => {
        setProfileData({
            ...profileData,
            madurez_evaluacion: { ...profileData.madurez_evaluacion, [categoria]: valor }
        });
        setIsDirty(true);
    };

    const handleCheckbox = (campo, valor) => {
        const currentList = profileData[campo] || [];
        const newList = currentList.includes(valor)
            ? currentList.filter(item => item !== valor)
            : [...currentList, valor];
        setProfileData({ ...profileData, [campo]: newList });
        setIsDirty(true);
    };

    const handleLogoUpload = async (e) => {
        try {
            setUploadingLogo(true);
            const file = e.target.files[0];
            if (!file) return;

            // P4 fix: Validate file type and size
            if (!file.type.startsWith('image/')) {
                toast.error('Solo se permiten archivos de imagen (JPG, PNG, SVG, WebP).');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('El archivo es demasiado grande. Máximo 2MB.');
                return;
            }

            const publicUrl = await storageService.uploadLogo(profileData.id, file);
            setProfileData({ ...profileData, logo_url: publicUrl });
            setIsDirty(true);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setErrorMsg(""); setSuccessMsg("");

        const toastId = toast.loading("Guardando cambios...");

        try {
            await profileService.update(profileData.id, profileData);
            setSaving(false);
            setSuccessMsg("Perfil público guardado correctamente.");
            setErrorMsg("");
            setIsDirty(false);
            toast.success("Perfil guardado con éxito", { id: toastId });
        } catch (err) {
            setSaving(false);
            setErrorMsg(err.message);
            setSuccessMsg("");
            toast.error("Ocurrió un error al guardar", { id: toastId });
        }
    };

    if (loading) return <LoadingSpinner message="Cargando perfil..." />;
    if (errorMsg && !profileData?.id && !isAdminView) return <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 text-red-700 border border-red-200 rounded-xl">{errorMsg}</div>;

    if (isAdminView) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-text flex items-center gap-3">
                        <UserCircle className="text-accent" size={32} />
                        Administración de Equipo
                    </h1>
                    <p className="text-textLight mt-2 text-lg">
                        Gestiona los accesos de Super Administradores a la plataforma RedCAD Hub.
                    </p>
                </div>

                <TeamMemberList
                    members={teamMembers}
                    onMembersChange={setTeamMembers}
                    isAdmin={true}
                    title="Accesos de Administrador"
                    subtitle="Añade correos electrónicos del equipo de POD o GIASAT. Cualquiera en esta lista, una vez guardado, podrá enviar su email a la página de Login para entrar como Super Admin."
                    addLabel="Añadir Administrador"
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-serif text-forest flex items-center gap-3">
                    <UserCircle className="text-accent" size={32} />
                    {targetCadId ? `Editando Perfil: ${profileData.nombre_comercial}` : "Mi Perfil de Red"}
                </h1>
                <p className="text-textLight mt-2 text-lg">
                    Configura la identidad estructural y la autoevaluación técnica de tu CAD. Esta información formará tu "tarjeta de presentación" en el Directorio.
                </p>
            </div>

            {successMsg && (
                <div className="p-4 bg-sage/20 border border-forest text-forest rounded-lg flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-forest"></span> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} /> {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- SECCIÓN ADMIN SOLO --- */}
                {authIsAdmin && targetCadId && (
                    <div className="bg-blueBgLight p-6 md:p-8 rounded-xl border-2 border-accent shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            Solo Administrador
                        </div>
                        <h2 className="text-xl font-bold font-serif text-text mb-6 flex items-center gap-2 border-b border-border pb-3">
                            <ShieldCheck className="text-accent" size={20} /> Configuración de Red (Administrador)
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Estado en la Red</label>
                                <select 
                                    name="estado" 
                                    value={profileData.estado || 'Activo'} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                                >
                                    <option value="Activo">🟢 Activo</option>
                                    <option value="Satélite">🟡 Satélite</option>
                                    <option value="Inactivo">🔴 Inactivo</option>
                                </select>
                                <p className="text-xs text-textLight mt-1 text-balance">Los inactivos no aparecerán en el Directorio público.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">¿Pertenece al Grupo Motor?</label>
                                <select 
                                    name="grupo_motor" 
                                    value={profileData.grupo_motor || 'No'} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                                >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                </select>
                                <p className="text-xs text-textLight mt-1 text-balance">Muestra una insignia especial en su Perfil del Directorio.</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* --------------------------- */}

                {/* Section 1: Identidad */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-text mb-6 flex items-center gap-2 border-b border-border pb-3">
                        <Building className="text-accent" size={20} /> Identidad y Contacto
                    </h2>

                    <div className="mb-8 flex items-end gap-6">
                        <div className="w-24 h-24 rounded-lg bg-sand border border-border flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {profileData.logo_url ? (
                                <img src={profileData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building size={32} className="text-forest/30" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-textLight mb-2">Logotipo / Imagen Representativa</label>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-sand text-text border border-border rounded-lg cursor-pointer hover:bg-border transition-colors text-sm font-medium">
                                <UploadCloud size={16} />
                                {uploadingLogo ? "Subiendo..." : "Subir Imagen"}
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nombre Comercial</label>
                            <input type="text" name="nombre_comercial" value={profileData.nombre_comercial || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Territorio (CCAA)</label>
                            <input type="text" name="territorio" value={profileData.territorio || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textLight mb-2">Descripción Corta / "Bio"</label>
                            <textarea name="descripcion_corta" value={profileData.descripcion_corta || ''} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="¿Cómo describirías vuestro proyecto en 3 líneas?"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Email Genérico / Público</label>
                            <input type="email" name="email_contacto" value={profileData.email_contacto || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Teléfono Genérico / Público</label>
                            <input type="text" name="telefono" value={profileData.telefono || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                    </div>
                </div>

                {/* Section Multi-User */}
                <TeamMemberList
                    members={teamMembers}
                    onMembersChange={setTeamMembers}
                    isAdmin={false}
                    cadId={profileData.id}
                    title="Accesos y Personas de Contacto"
                    subtitle="Añade correos electrónicos de las personas de tu equipo. Cualquiera en esta lista, una vez guardado, podrá enviar su email a la página de Login para recibir un enlace de acceso seguro a este perfil."
                    addLabel="Añadir Persona"
                />

                {/* Section 2: Estructura */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-text mb-6 flex items-center gap-2 border-b border-border pb-3">
                        <LinkIcon className="text-accent" size={20} /> Estructura y Dimensión
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Forma Jurídica</label>
                            <select name="forma_juridica" value={profileData.forma_juridica || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                <option value="SAT">SAT</option>
                                <option value="Cooperativa de primer grado">Cooperativa de primer grado</option>
                                <option value="Cooperativa de segundo grado">Cooperativa de segundo grado</option>
                                <option value="Asociación">Asociación</option>
                                <option value="Sociedad Limitada (SL)">Sociedad Limitada (SL)</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Año de Constitución</label>
                            <input type="number" name="ano_constitucion" value={profileData.ano_constitucion || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nº Socias Productoras</label>
                            <input type="number" name="num_socios_productoras" value={profileData.num_socios_productoras || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nº Personas en Plantilla</label>
                            <input type="number" name="num_personas_trabajadoras" value={profileData.num_personas_trabajadoras || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textLight mb-2">Tipo de Gobernanza</label>
                            <select name="tipo_gobernanza" value={profileData.tipo_gobernanza || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                <option value="Órganos de Gobierno y equipo técnico">Órganos de Gobierno y equipo técnico</option>
                                <option value="Órganos de Gobierno + Equipo + Grupos Trabajo">Órganos de Gobierno + Equipo + Grupos Trabajo</option>
                                <option value="Secciones cooperativas">Órganos de Gobierno con secciones cooperativas</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 mt-4 pt-6 border-t border-border">
                            <label className="block text-sm font-bold text-text mb-3">Perfiles del equipo técnico (Plantilla propia)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                                {PERFILES_EQUIPO_OPTIONS.map(perfil => (
                                    <label key={perfil} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={profileData.perfiles_equipo.includes(perfil)} 
                                            onChange={() => handleCheckbox('perfiles_equipo', perfil)} 
                                            className="mt-1 accent-forest w-4 h-4 rounded border-border flex-shrink-0" 
                                        />
                                        <span className="leading-snug">{perfil}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textLight mb-2">Propiedad de las instalaciones logísticas</label>
                            <select name="propiedad_instalaciones" value={profileData.propiedad_instalaciones || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                <option value="Propias">Propias</option>
                                <option value="Alquiladas">Alquiladas</option>
                                <option value="Cesión de uso">Cesión de uso</option>
                                <option value="Mixto">Mixto</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Madurez Técnica (Semáforo) */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm overflow-hidden">
                    <h2 className="text-xl font-bold font-serif text-text mb-4 flex items-center gap-2 border-b border-border pb-3">
                        <Microscope className="text-accent" size={20} /> Autoevaluación Técnica
                    </h2>
                    <p className="text-sm text-textLight mb-6">Evalúa de forma honesta las fortalezas y puntos de mejora de tu agrupación. Esto ayudará a conectar ofertas y demandas de intercooperación en la Red.</p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="text-sm text-textLight border-b border-border">
                                    <th className="pb-3 pt-2 font-medium w-1/3">ÁMBITO TÉCNICO</th>
                                    <th className="pb-3 pt-2 font-medium text-center">🔴 Necesita apoyo</th>
                                    <th className="pb-3 pt-2 font-medium text-center">🟡 En desarrollo</th>
                                    <th className="pb-3 pt-2 font-medium text-center">🟢 Consolidado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {MADUREZ_CATEGORIAS.map((cat, idx) => (
                                    <tr key={idx} className="hover:bg-sand/10 transition-colors">
                                        <td className="py-4 text-sm font-medium text-text relative">
                                            <div className="flex items-center gap-2">
                                                {cat}
                                                {MADUREZ_TOOLTIPS[cat] && (
                                                    <div
                                                        onMouseEnter={() => setActiveTooltip(cat)}
                                                        onMouseLeave={() => setActiveTooltip(null)}
                                                        className="cursor-pointer text-sage hover:text-forest transition-colors relative"
                                                    >
                                                        <HelpCircle size={14} />
                                                        {activeTooltip === cat && (
                                                            <div className="absolute top-full left-0 z-50 mt-1 bg-text text-white p-3 rounded-lg text-xs leading-relaxed w-64 shadow-lg pointer-events-none">
                                                                {MADUREZ_TOOLTIPS[cat]}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <input type="radio" name={`madurez_${idx}`} checked={profileData.madurez_evaluacion[cat] === "🔴 Necesita apoyo"} onChange={() => handleMatrixChange(cat, "🔴 Necesita apoyo")} className="w-4 h-4 accent-red cursor-pointer" />
                                        </td>
                                        <td className="py-4 text-center">
                                            <input type="radio" name={`madurez_${idx}`} checked={profileData.madurez_evaluacion[cat] === "🟡 En desarrollo"} onChange={() => handleMatrixChange(cat, "🟡 En desarrollo")} className="w-4 h-4 accent-accent cursor-pointer" />
                                        </td>
                                        <td className="py-4 text-center">
                                            <input type="radio" name={`madurez_${idx}`} checked={profileData.madurez_evaluacion[cat] === "🟢 Consolidado"} onChange={() => handleMatrixChange(cat, "🟢 Consolidado")} className="w-4 h-4 accent-forest cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">¿En qué ámbitos considera que tiene prácticas consolidadas que podrían servir de inspiración al resto?</label>
                            <textarea name="madurez_fortalezas" value={profileData.madurez_fortalezas || ''} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">¿Cuáles son las mayores dificultades o cuellos de botella que limitan el crecimiento?</label>
                            <textarea name="madurez_cuellos_botella" value={profileData.madurez_cuellos_botella || ''} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30"></textarea>
                        </div>
                    </div>
                </div>

                {/* Section 4: Intercooperación */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-text mb-6 flex items-center gap-2 border-b border-border pb-3">
                        <Users className="text-accent" size={20} /> Intercooperación Técnica
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-text mb-3">¿En qué ámbitos se podría compartir experiencia con otros CAD?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {AMBITOS_INTERCOOP.map(ambito => (
                                    <label key={`comp_${ambito}`} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors relative">
                                        <input type="checkbox" checked={profileData.intercoop_compartir.includes(ambito)} onChange={() => handleCheckbox('intercoop_compartir', ambito)} className="mt-1 accent-forest w-4 h-4 rounded border-border flex-shrink-0" />
                                        <span className="leading-snug">{ambito}</span>
                                        {INTERCOOP_TOOLTIPS[ambito] && (
                                            <div
                                                onMouseEnter={() => setActiveTooltip(`comp_${ambito}`)}
                                                onMouseLeave={() => setActiveTooltip(null)}
                                                className="cursor-pointer text-sage hover:text-forest transition-colors ml-1 mt-[2px] relative z-10"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            >
                                                <HelpCircle size={14} />
                                                {activeTooltip === `comp_${ambito}` && (
                                                    <div className="absolute top-full left-0 mt-1 bg-text text-white p-2 text-xs rounded shadow w-48 font-normal whitespace-pre-wrap">
                                                        {INTERCOOP_TOOLTIPS[ambito]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-3">¿En qué ámbitos se necesitaría más apoyo o formación?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {AMBITOS_INTERCOOP.map(ambito => (
                                    <label key={`apoyo_${ambito}`} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors relative">
                                        <input type="checkbox" checked={profileData.intercoop_apoyo_necesario.includes(ambito)} onChange={() => handleCheckbox('intercoop_apoyo_necesario', ambito)} className="mt-1 accent-forest w-4 h-4 rounded border-border flex-shrink-0" />
                                        <span className="leading-snug">{ambito}</span>
                                        {INTERCOOP_TOOLTIPS[ambito] && (
                                            <div
                                                onMouseEnter={() => setActiveTooltip(`apoyo_${ambito}`)}
                                                onMouseLeave={() => setActiveTooltip(null)}
                                                className="cursor-pointer text-sage hover:text-forest transition-colors ml-1 mt-[2px] relative z-10"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            >
                                                <HelpCircle size={14} />
                                                {activeTooltip === `apoyo_${ambito}` && (
                                                    <div className="absolute top-full left-0 mt-1 bg-text text-white p-2 text-xs rounded shadow w-48 font-normal whitespace-pre-wrap">
                                                        {INTERCOOP_TOOLTIPS[ambito]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Disposición a participar activamente</label>
                                <select name="intercoop_disposicion" value={profileData.intercoop_disposicion || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    <option value="Sí, tanto asistiendo como aportando">Sí, tanto asistiendo como aportando</option>
                                    <option value="Sí, principalmente como participante">Sí, principalmente como participante</option>
                                    <option value="Interesa pero poca disponibilidad">Interesa pero poca disponibilidad</option>
                                    <option value="No es prioritario ahora">No es prioritario ahora</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Embajadores / Referentes en el CAD</label>
                                <input type="text" name="intercoop_referentes" value={profileData.intercoop_referentes || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Ej: Ana (Logística), Pedro (Marketing)" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 pb-10">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-forest text-white px-8 py-3 rounded-xl font-medium tracking-wide hover:bg-forestLight transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {saving ? "Guardando..." : <><Save size={20} /> Guardar Perfil de Red Completo</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-accent mt-10 animate-pulse">Cargando constructor de perfil...</div>}>
            <ProfileForm />
        </Suspense>
    );
}
