"use client";
import { useEffect, useState, Suspense, useRef, useCallback, useMemo } from "react";
import { Save, UserCircle, Building, Link as LinkIcon, AlertCircle, Microscope, Users, UploadCloud, HelpCircle, ShieldCheck, Wrench, Landmark, Globe, KeyRound, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileService, teamService, storageService } from "@/lib/supabaseService";
import { supabase } from "@/utils/supabase";
import TeamMemberList from "@/components/TeamMemberList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { 
    PERFILES_EQUIPO_OPTIONS, 
    MADUREZ_CATEGORIAS, 
    MADUREZ_TOOLTIPS, 
    AMBITOS_INTERCOOP, 
    INTERCOOP_TOOLTIPS,
    ACTIVIDADES_CAD_OPTIONS,
    INFRAESTRUCTURAS_OPTIONS,
    MODELO_ABASTECIMIENTO_OPTIONS,
    DOCUMENTOS_GOBERNANZA_OPTIONS,
    PROTOCOLOS_OPTIONS,
    SUPERFICIE_OPTIONS,
    CCAA_OPTIONS,
    FORMA_JURIDICA_OPTIONS,
    TIPO_GOBERNANZA_OPTIONS,
    CRITERIOS_COMPRAS_OPTIONS
} from "@/config/profileOptions";

function ProfileForm() {
    const { isAdmin: authIsAdmin, cadId: authCadId, email: authEmail, loading: authLoading } = useAuth();
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
        forma_juridica: [],
        forma_juridica_otros: "",
        tipo_gobernanza: [],
        tipo_gobernanza_otros: "",
        tipo_gobernanza_describir: "",
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
        perfiles_equipo_otros: "",
        propiedad_instalaciones: "",
        // v2.0 expanded fields — stored in datos_adicionales JSONB
        datos_adicionales: {
            municipio_sede: "",
            inicio_actividad: "",
            num_socias_femeninas: "",
            num_socias_activas: "",
            num_mujeres_plantilla: "",
            roles_externalizados: "",
            documentos_gobernanza: [],
            protocolos_internos: [],
            presencia_mujeres_direccion: "",
            actividades_cad: [],
            actividades_otros: "",
            motivo_creacion: "",
            modelo_abastecimiento: "",
            modelo_abastecimiento_otros: "",
            regulacion_compras: "",
            regulacion_compras_otros: "",
            criterios_compras: "",
            criterios_compras_otros: "",
            servicios_externalizados: "",
            porcentaje_mujeres_junta: "",
            documentos_gobernanza_otros: "",
            protocolos_otros: "",
            foto_grupo_url: "",
            infraestructuras: [],
            infraestructuras_otros: "",
            superficie_instalaciones: "",
            pertenece_red_supraterritorial: "",
            redes_supraterritoriales: "",
            contacto_intercoop: "",
            contacto_intercoop_secundario: "",
        }
    });

    const [teamMembers, setTeamMembers] = useState([]);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPw, setShowNewPw] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
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
                        datos_adicionales: {
                            municipio_sede: "",
                            inicio_actividad: "",
                            num_socias_femeninas: "",
                            num_socias_activas: "",
                            num_mujeres_plantilla: "",
                            roles_externalizados: "",
                            documentos_gobernanza: [],
                            protocolos_internos: [],
                            presencia_mujeres_direccion: "",
                            actividades_cad: [],
                            actividades_otros: "",
                            motivo_creacion: "",
                            modelo_abastecimiento: "",
                            modelo_abastecimiento_otros: "",
                            regulacion_compras: "",
                            infraestructuras: [],
                            infraestructuras_otros: "",
                            superficie_instalaciones: "",
                            pertenece_red_supraterritorial: "",
                            redes_supraterritoriales: "",
                            contacto_intercoop: "",
                            contacto_intercoop_secundario: "",
                            ...(profile.datos_adicionales || {}),
                        },
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

    // Handler for datos_adicionales text/select fields
    const handleDatosChange = (e) => {
        setProfileData({
            ...profileData,
            datos_adicionales: { ...profileData.datos_adicionales, [e.target.name]: e.target.value }
        });
        setIsDirty(true);
    };

    // Handler for datos_adicionales checkbox lists
    const handleDatosCheckbox = (campo, valor) => {
        const currentList = profileData.datos_adicionales[campo] || [];
        const newList = currentList.includes(valor)
            ? currentList.filter(item => item !== valor)
            : [...currentList, valor];
        setProfileData({
            ...profileData,
            datos_adicionales: { ...profileData.datos_adicionales, [campo]: newList }
        });
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

    const SECTION_NAV = useMemo(() => [
        { id: 'sec-identidad', label: 'Identidad y Contacto', icon: '🏢' },
        { id: 'sec-estructura', label: 'Estructura y Dimensión', icon: '🔗' },
        { id: 'sec-composicion', label: 'Composición Detallada', icon: '👥' },
        { id: 'sec-actividad', label: 'Actividad y Servicios', icon: '🔧' },
        { id: 'sec-infraestructuras', label: 'Infraestructuras y Redes', icon: '🏛️' },
        { id: 'sec-autoevaluacion', label: 'Autoevaluación Técnica', icon: '🔬' },
        { id: 'sec-intercoop', label: 'Intercooperación Técnica', icon: '🤝' },
    ], []);

    const [openSection, setOpenSection] = useState('sec-identidad');

    const toggleSection = useCallback((id) => {
        setOpenSection(prev => {
            const next = prev === id ? null : id;
            if (next) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            return next;
        });
    }, []);

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
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
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

            <form onSubmit={handleSubmit} className="space-y-3">

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

                {/* Section 1: Identidad — always visible */}
                <div id="sec-identidad" className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm">
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
                            <select name="territorio" value={profileData.territorio || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                {CCAA_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
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

                {/* Section: Tu Cuenta — only for logged-in CAD users, not when admin is editing */}
                {!isAdminView && !targetCadId && (
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-bold font-serif text-text mb-6 flex items-center gap-2 border-b border-border pb-3">
                            <KeyRound className="text-accent" size={20} /> Tu Cuenta
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-sand/30 p-4 rounded-lg border border-border">
                                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                    <UserCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-textLight font-medium">Email de acceso (Login)</p>
                                    <p className="text-text font-semibold text-base">{authEmail}</p>
                                </div>
                            </div>

                            {!showPasswordForm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm(true)}
                                    className="text-sm text-accent hover:text-accentHover font-medium transition-colors flex items-center gap-2"
                                >
                                    <KeyRound size={14} /> Cambiar contraseña
                                </button>
                            ) : (
                                <div className="bg-blueBgLight p-5 rounded-lg border border-border space-y-4 animate-fade-in">
                                    <h3 className="text-sm font-bold text-text">Nueva contraseña</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type={showNewPw ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Nueva contraseña (min. 6 caracteres)"
                                                className="w-full px-4 py-2 pr-10 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white text-sm"
                                            />
                                            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-2 text-textLight hover:text-accent transition-colors">
                                                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <input
                                            type={showNewPw ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirmar contraseña"
                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-accent bg-white text-sm ${
                                                confirmPassword && confirmPassword !== newPassword ? 'border-red' : 'border-border'
                                            }`}
                                        />
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-red text-xs">Las contraseñas no coinciden</p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            disabled={changingPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                                            onClick={async () => {
                                                setChangingPassword(true);
                                                try {
                                                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                                                    if (error) throw error;
                                                    toast.success("Contraseña actualizada correctamente");
                                                    setShowPasswordForm(false);
                                                    setNewPassword("");
                                                    setConfirmPassword("");
                                                } catch (err) {
                                                    toast.error("Error: " + err.message);
                                                }
                                                setChangingPassword(false);
                                            }}
                                            className="text-sm bg-forest text-white px-4 py-2 rounded-lg hover:bg-forestLight transition-colors font-medium disabled:opacity-50"
                                        >
                                            {changingPassword ? "Guardando..." : "Guardar nueva contraseña"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); }}
                                            className="text-sm text-textLight hover:text-text font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section: Personas de Contacto */}
                <TeamMemberList
                    members={teamMembers}
                    onMembersChange={setTeamMembers}
                    isAdmin={false}
                    cadId={profileData.id}
                    title="Personas de Contacto"
                    subtitle="Añade datos de las personas clave de tu equipo. Esta información será visible solo internamente dentro de la Red."
                    addLabel="Añadir Persona"
                />

                {/* Section 2: Estructura */}
                <div id="sec-estructura" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-estructura')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-estructura' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">🔗</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Estructura y Dimensión</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-estructura' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-estructura' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm mt-2 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-text mb-3">Forma Jurídica (marcar todas las que apliquen)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-2">
                                {FORMA_JURIDICA_OPTIONS.map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.forma_juridica || []).includes(opt)} onChange={() => handleCheckbox('forma_juridica', opt)} className="accent-forest w-4 h-4" />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <input type="text" name="forma_juridica_otros" value={profileData.forma_juridica_otros || ''} onChange={handleChange} className="mt-2 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro (especificar)..." />
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
                            <label className="block text-sm font-bold text-text mb-3">Tipo de Gobernanza (marcar todas las que apliquen)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {TIPO_GOBERNANZA_OPTIONS.map(opt => (
                                    <label key={opt} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.tipo_gobernanza || []).includes(opt)} onChange={() => handleCheckbox('tipo_gobernanza', opt)} className="mt-1 accent-forest w-4 h-4" />
                                        <span className="leading-snug">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <input type="text" name="tipo_gobernanza_otros" value={profileData.tipo_gobernanza_otros || ''} onChange={handleChange} className="mt-2 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro (especificar)..." />
                            <textarea name="tipo_gobernanza_describir" value={profileData.tipo_gobernanza_describir || ''} onChange={handleChange} rows="2" className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-sand/30 text-sm focus:ring-1 focus:ring-accent" placeholder="Si no coincide exactamente con ninguna opción, describir aquí..."></textarea>
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
                            <input type="text" name="perfiles_equipo_otros" value={profileData.perfiles_equipo_otros || ''} onChange={handleChange} className="mt-3 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro perfil no listado..." />
                        </div>

                    </div>
                    </div>
                    )}
                </div>

                {/* Section 2b: Composición Detallada (v2.0) */}
                <div id="sec-composicion" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-composicion')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-composicion' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">👥</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Composición Detallada</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-composicion' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-composicion' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm mt-2 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Municipio sede</label>
                            <input type="text" name="municipio_sede" value={profileData.datos_adicionales.municipio_sede || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Ej: Antequera" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Inicio de actividad (si ≠ constitución)</label>
                            <input type="number" name="inicio_actividad" value={profileData.datos_adicionales.inicio_actividad || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Año" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nº socias con titularidad femenina</label>
                            <input type="number" name="num_socias_femeninas" value={profileData.datos_adicionales.num_socias_femeninas || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nº socias productoras activas</label>
                            <input type="number" name="num_socias_activas" value={profileData.datos_adicionales.num_socias_activas || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Nº mujeres en plantilla</label>
                            <input type="number" name="num_mujeres_plantilla" value={profileData.datos_adicionales.num_mujeres_plantilla || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight mb-2">Presencia de mujeres en dirección</label>
                            <select name="presencia_mujeres_direccion" value={profileData.datos_adicionales.presencia_mujeres_direccion || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                <option value="Sí, en la dirección del equipo técnico">Sí, en la dirección del equipo técnico</option>
                                <option value="Sí, en la Junta Rectora o similares">Sí, en la Junta Rectora o similares</option>
                                <option value="En ambas">En ambas</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        {(profileData.datos_adicionales.presencia_mujeres_direccion === "Sí, en la Junta Rectora o similares" || profileData.datos_adicionales.presencia_mujeres_direccion === "En ambas") && (
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">% aprox. de mujeres en Junta Rectora</label>
                                <input type="number" name="porcentaje_mujeres_junta" value={profileData.datos_adicionales.porcentaje_mujeres_junta || ''} onChange={handleDatosChange} min="0" max="100" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="%" />
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textLight mb-2">Roles externalizados</label>
                            <textarea name="roles_externalizados" value={profileData.datos_adicionales.roles_externalizados || ''} onChange={handleDatosChange} rows="2" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Ej: Asesoría fiscal, logística subcontratada..."></textarea>
                        </div>

                        <div className="md:col-span-2 mt-2 pt-4 border-t border-border">
                            <label className="block text-sm font-bold text-text mb-3">Documentos de gobernanza</label>
                            <div className="flex flex-wrap gap-3 pl-2">
                                {DOCUMENTOS_GOBERNANZA_OPTIONS.map(doc => (
                                    <label key={doc} className="flex items-center gap-2 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.datos_adicionales.documentos_gobernanza || []).includes(doc)} onChange={() => handleDatosCheckbox('documentos_gobernanza', doc)} className="accent-forest w-4 h-4" />
                                        <span>{doc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-text mb-3">Protocolos internos</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {PROTOCOLOS_OPTIONS.map(prot => (
                                    <label key={prot} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.datos_adicionales.protocolos_internos || []).includes(prot)} onChange={() => handleDatosCheckbox('protocolos_internos', prot)} className="mt-1 accent-forest w-4 h-4" />
                                        <span className="leading-snug">{prot}</span>
                                    </label>
                                ))}
                            </div>
                            <input type="text" name="protocolos_otros" value={profileData.datos_adicionales.protocolos_otros || ''} onChange={handleDatosChange} className="mt-3 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro protocolo no listado..." />
                        </div>
                    </div>
                </div>
                    )}
                </div>

                {/* Section 2c: Actividad y Servicios (v2.0) */}
                <div id="sec-actividad" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-actividad')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-actividad' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">🔧</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Actividad y Servicios</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-actividad' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-actividad' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm mt-2 animate-fade-in">

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text mb-3">Actividades o servicios del CAD</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {ACTIVIDADES_CAD_OPTIONS.map(act => (
                                    <label key={act} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.datos_adicionales.actividades_cad || []).includes(act)} onChange={() => handleDatosCheckbox('actividades_cad', act)} className="mt-1 accent-forest w-4 h-4" />
                                        <span className="leading-snug">{act}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-3 pl-2">
                                <input type="text" name="actividades_otros" value={profileData.datos_adicionales.actividades_otros || ''} onChange={handleDatosChange} className="w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otros servicios no listados..." />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="block text-sm font-medium text-textLight mb-2">Motivo principal de creación de la agrupación</label>
                            <textarea name="motivo_creacion" value={profileData.datos_adicionales.motivo_creacion || ''} onChange={handleDatosChange} rows="2" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="¿Qué necesidad originaria motivó la creación?"></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Modelo de abastecimiento</label>
                                <select name="modelo_abastecimiento" value={profileData.datos_adicionales.modelo_abastecimiento || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    {MODELO_ABASTECIMIENTO_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <input type="text" name="modelo_abastecimiento_otros" value={profileData.datos_adicionales.modelo_abastecimiento_otros || ''} onChange={handleDatosChange} className="mt-2 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro modelo..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">¿Regulado en Estatutos/RFI?</label>
                                <select name="regulacion_compras" value={profileData.datos_adicionales.regulacion_compras || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                </select>
                                <input type="text" name="regulacion_compras_otros" value={profileData.datos_adicionales.regulacion_compras_otros || ''} onChange={handleDatosChange} className="mt-2 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro (especificar)..." />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="block text-sm font-medium text-textLight mb-2">Criterios o acuerdos para compras externas</label>
                            <select name="criterios_compras" value={profileData.datos_adicionales.criterios_compras || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                <option value="">Selecciona...</option>
                                {CRITERIOS_COMPRAS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <input type="text" name="criterios_compras_otros" value={profileData.datos_adicionales.criterios_compras_otros || ''} onChange={handleDatosChange} className="mt-2 w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otro criterio..." />
                        </div>
                    </div>
                </div>
                    )}
                </div>

                {/* Section 2d: Infraestructuras y Redes (v2.0) */}
                <div id="sec-infraestructuras" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-infraestructuras')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-infraestructuras' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">🏛️</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Infraestructuras y Redes</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-infraestructuras' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-infraestructuras' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm mt-2 animate-fade-in">

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Propiedad de las instalaciones logísticas</label>
                                <select name="propiedad_instalaciones" value={profileData.propiedad_instalaciones || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    <option value="Propias">Propias</option>
                                    <option value="Alquiladas">Alquiladas</option>
                                    <option value="Cesión de uso">Cesión de uso</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Superficie total instalaciones</label>
                                <select name="superficie_instalaciones" value={profileData.datos_adicionales.superficie_instalaciones || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    {SUPERFICIE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="block text-sm font-bold text-text mb-3">Infraestructuras o activos clave</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                {INFRAESTRUCTURAS_OPTIONS.map(inf => (
                                    <label key={inf} className="flex items-start gap-3 text-sm text-textLight cursor-pointer hover:text-text transition-colors">
                                        <input type="checkbox" checked={(profileData.datos_adicionales.infraestructuras || []).includes(inf)} onChange={() => handleDatosCheckbox('infraestructuras', inf)} className="mt-1 accent-forest w-4 h-4" />
                                        <span className="leading-snug">{inf}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-3 pl-2">
                                <input type="text" name="infraestructuras_otros" value={profileData.datos_adicionales.infraestructuras_otros || ''} onChange={handleDatosChange} className="w-full px-4 py-2 rounded-lg border border-dashed border-border bg-transparent text-sm italic focus:ring-1 focus:ring-accent" placeholder="Otros activos no listados..." />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="block text-sm font-medium text-textLight mb-2">Servicios o activos clave externalizados</label>
                            <textarea name="servicios_externalizados" value={profileData.datos_adicionales.servicios_externalizados || ''} onChange={handleDatosChange} rows="2" className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Ej: logística externalizada, contabilidad con asesoría, almacén compartido..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">¿Pertenece a otra red supraterritorial?</label>
                                <select name="pertenece_red_supraterritorial" value={profileData.datos_adicionales.pertenece_red_supraterritorial || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30">
                                    <option value="">Selecciona...</option>
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>

                        {profileData.datos_adicionales.pertenece_red_supraterritorial === "Sí" && (
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">¿Cuál(es)?</label>
                                <input type="text" name="redes_supraterritoriales" value={profileData.datos_adicionales.redes_supraterritoriales || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Nombre de la(s) red(es)" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Contacto principal para intercooperación</label>
                                <input type="text" name="contacto_intercoop" value={profileData.datos_adicionales.contacto_intercoop || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Nombre, cargo, email, teléfono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-2">Contacto secundario (opcional)</label>
                                <input type="text" name="contacto_intercoop_secundario" value={profileData.datos_adicionales.contacto_intercoop_secundario || ''} onChange={handleDatosChange} className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-sand/30" placeholder="Nombre, cargo, email, teléfono" />
                            </div>
                        </div>
                    </div>
                </div>
                    )}
                </div>
                <div id="sec-autoevaluacion" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-autoevaluacion')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-autoevaluacion' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">🔬</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Autoevaluación Técnica</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-autoevaluacion' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-autoevaluacion' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm overflow-hidden mt-2 animate-fade-in">
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
                    )}
                </div>

                {/* Section 4: Intercooperación */}
                <div id="sec-intercoop" className="scroll-mt-24">
                    <button type="button" onClick={() => toggleSection('sec-intercoop')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${openSection === 'sec-intercoop' ? 'bg-white shadow-sm border border-border' : 'bg-white/60 hover:bg-white border border-transparent hover:border-border'}`}>
                        <span className="text-xl">🤝</span>
                        <span className="text-lg font-bold font-serif text-text flex-1 text-left">Intercooperación Técnica</span>
                        <ChevronDown className={`text-textLight transition-transform duration-200 ${openSection === 'sec-intercoop' ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {openSection === 'sec-intercoop' && (
                    <div className="bg-white p-6 md:p-10 rounded-xl border border-border shadow-sm mt-2 animate-fade-in">

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
                    )}
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
