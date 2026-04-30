"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Users, LayoutDashboard, Settings, Trash2, PlusCircle, KeyRound, X, BarChart3, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileService, formService, authService } from "@/lib/supabaseService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { adminResetUserPassword } from "@/app/actions/adminAuth";
import { buildProgressReport } from "@/lib/reportUtils";

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();
    const [cads, setCads] = useState([]);
    const [allForms, setAllForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Password Reset Modal State
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [resetTargetEmail, setResetTargetEmail] = useState("");
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    // Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: null, nombre: "" });
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch CAD list + form data
    const fetchData = async () => {
        try {
            const [profiles, forms] = await Promise.all([
                profileService.listForAdminWithEmails(),
                formService.listAll(),
            ]);
            setCads(profiles);
            setAllForms(forms);
        } catch (err) {
            console.error('Admin fetchData failed:', err.message);
            toast.error(err.message);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        (async () => {
            await fetchData();
            setLoading(false);
        })();
    }, [authLoading, isAdmin]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        toast.success("Datos actualizados");
    };

    // Build progress report from loaded data
    const progressReport = useMemo(() => {
        if (cads.length === 0) return [];
        return buildProgressReport(cads, allForms);
    }, [cads, allForms]);

    // Derived summary stats
    const submittedCount = useMemo(() =>
        progressReport.filter(r => r.submittedAt).length
    , [progressReport]);

    const averageProgress = useMemo(() => {
        const withEmail = progressReport.filter(r => r.userEmail);
        if (withEmail.length === 0) return 0;
        const sum = withEmail.reduce((acc, r) => acc + r.progressPercent, 0);
        return Math.round(sum / withEmail.length);
    }, [progressReport]);

    // Progress lookup by cadId for the table
    const progressByCadId = useMemo(() => {
        const map = {};
        progressReport.forEach(r => { map[r.cadId] = r; });
        return map;
    }, [progressReport]);

    const handleOpenResetModal = async (cadId) => {
        const toastId = toast.loading("Buscando usuario vinculado...");
        try {
            const resolvedEmail = await formService.getFormOwnerEmail(cadId);
            toast.dismiss(toastId);
            
            if (!resolvedEmail) {
                toast.error("Este CAD no tiene un email de contacto asignado todavía.");
                return;
            }

            setResetTargetEmail(resolvedEmail);
            const shortName = resolvedEmail.split('@')[0].replace(/[^a-zA-Z]/g, '');
            setResetPasswordValue(shortName.charAt(0).toUpperCase() + shortName.slice(1) + new Date().getFullYear() + "!");
            setResetModalOpen(true);
        } catch (err) {
            toast.error("Error resolviendo email: " + err.message, { id: toastId });
        }
    };

    const handleConfirmResetPassword = async () => {
        if (!resetPasswordValue || resetPasswordValue.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (resetPasswordValue !== resetPasswordConfirm) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        const toastId = toast.loading("Asignando contraseña...");
        setIsResetting(true);

        try {
            const accessToken = await authService.getAccessToken();
            if (!accessToken) throw new Error("No hay sesión activa de administrador.");

            const result = await adminResetUserPassword(accessToken, resetTargetEmail, resetPasswordValue);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(result.message, { id: toastId });
            setResetModalOpen(false);
            setResetPasswordConfirm("");
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
        setIsResetting(false);
    };

    const handleCreateCad = async () => {
        const toastId = toast.loading("Creando nueva agrupación...");
        try {
            const data = await profileService.create();
            toast.success("Agrupación creada con éxito", { id: toastId });
            router.push(`/profile?cad_id=${data.id}`);
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    const handleDeleteCad = async (id, nombre) => {
        setDeleteTarget({ id, nombre });
        setDeleteModalOpen(true);
    };

    const confirmDeleteCad = async () => {
        setIsDeleting(true);
        const toastId = toast.loading("Eliminando agrupación...");
        try {
            await profileService.delete(deleteTarget.id);
            setCads(cads.filter(cad => cad.id !== deleteTarget.id));
            toast.success("Agrupación eliminada", { id: toastId });
            setDeleteModalOpen(false);
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
        setIsDeleting(false);
    };

    if (authLoading || loading) {
        return <LoadingSpinner message="Cargando panel..." />;
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[50vh]">
                <div className="h-20 w-20 bg-red/10 rounded-full flex items-center justify-center mb-6 text-red">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-3xl font-bold font-serif text-text mb-4">Acceso Denegado</h1>
                <p className="text-textLight max-w-md">
                    Esta área está reservada exclusivamente para la Secretaría Técnica de la Red de CAD.
                    No tienes permisos de Administrador.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-text flex items-center gap-3">
                        <LayoutDashboard className="text-accent" /> Panel de Control (Admin)
                    </h1>
                    <p className="text-textLight mt-2 text-lg">
                        Visión global de las agrupaciones y control de la plataforma.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-sm bg-white text-text px-4 py-2 rounded-lg hover:bg-sand transition-colors flex items-center gap-2 font-medium border border-border shadow-sm disabled:opacity-50"
                    title="Actualizar datos"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    Actualizar
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-textLight text-sm font-medium">Total CADs Registrados</p>
                            <h3 className="text-3xl font-bold font-serif text-text mt-2">{cads.length}</h3>
                        </div>
                        <div className="p-3 bg-forestLight/10 rounded-lg text-forest">
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-textLight text-sm font-medium">Diagnósticos Completados</p>
                            <h3 className="text-3xl font-bold font-serif text-text mt-2">
                                {submittedCount}
                                <span className="text-base font-normal text-textLight ml-1">/ {cads.length}</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-accent/10 rounded-lg text-accent">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-textLight text-sm font-medium">Progreso Medio</p>
                            <h3 className="text-3xl font-bold font-serif text-text mt-2">
                                {averageProgress}%
                            </h3>
                            <div className="mt-2 h-2 w-full bg-sand rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-700"
                                    style={{ width: `${averageProgress}%` }}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-sage/20 rounded-lg text-forest">
                            <BarChart3 size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CAD Directory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-blueBgLight/50 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold font-serif text-text">Directorio de Entidades</h2>
                    <div className="flex gap-3 flex-wrap">
                        <Link
                            href="/admin/reports"
                            className="text-sm bg-white text-text px-4 py-2 rounded-lg hover:bg-sand transition-colors flex items-center gap-2 font-medium border border-border shadow-sm"
                        >
                            <BarChart3 size={16} className="text-forest" /> Informes
                        </Link>
                        <button
                            onClick={handleCreateCad}
                            className="text-sm bg-accent text-text px-4 py-2 rounded-lg hover:bg-accentHover transition-colors flex items-center gap-2 font-bold"
                        >
                            <PlusCircle size={16} /> Crear Nuevo CAD
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-sand/10 text-textLight text-sm border-b border-border">
                                <th className="px-6 py-4 font-medium">ENTIDAD</th>
                                <th className="px-6 py-4 font-medium">TERRITORIO</th>
                                <th className="px-6 py-4 font-medium">ESTADO</th>
                                <th className="px-6 py-4 font-medium">PROGRESO</th>
                                <th className="px-6 py-4 font-medium">DIAGNÓSTICO</th>
                                <th className="px-6 py-4 font-medium text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {cads.map((cad) => {
                                const prog = progressByCadId[cad.id];
                                return (
                                    <tr key={cad.id} className="hover:bg-sand/10 transition-colors">
                                        <td className="px-6 py-4 max-w-[180px]">
                                            <div className="font-semibold text-text truncate" title={cad.nombre_comercial}>{cad.nombre_comercial}</div>
                                        </td>
                                        <td className="px-6 py-4 text-text">{cad.territorio || "-"}</td>
                                        <td className="px-6 py-4">
                                            {(cad.estado || "").toLowerCase() === "inactivo" || (cad.estado || "").toLowerCase() === "inactive" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red/10 text-red">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red"></span>
                                                    Inactivo
                                                </span>
                                            ) : (cad.estado || "").toLowerCase() === "satélite" || (cad.estado || "").toLowerCase() === "satelite" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                    Satélite
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage/20 text-forest">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                                                    Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ProgressCell progress={prog} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/form?cad_id=${cad.id}`}
                                                className="text-textLight hover:text-accent text-sm font-medium transition-colors inline-flex items-center gap-1"
                                            >
                                                Rellenar Formulario <span>→</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenResetModal(cad.id)}
                                                    className="text-warmGray hover:text-accent text-sm font-medium transition-colors border border-border bg-white shadow-sm px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5"
                                                    title="Gestionar Acceso"
                                                >
                                                    <KeyRound size={16} /> Contraseña
                                                </button>
                                                <Link
                                                    href={`/profile?cad_id=${cad.id}`}
                                                    className="text-accent hover:text-accentHover text-sm font-medium transition-colors border border-border bg-white shadow-sm px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                                                >
                                                    Editar Perfil
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteCad(cad.id, cad.nombre_comercial)}
                                                    className="text-red hover:text-white hover:bg-red p-1.5 rounded-lg transition-colors border border-transparent hover:border-red"
                                                    title="Eliminar Perfil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {cads.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-textLight">
                                        No se encontraron perfiles de CAD.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Password Reset Modal */}
            {resetModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-border bg-sand/30 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-serif text-text flex items-center gap-2">
                                <KeyRound size={20} className="text-accent" /> Asignar Contraseña
                            </h3>
                            <button onClick={() => setResetModalOpen(false)} className="text-textLight hover:text-red transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-sage/10 p-4 rounded-lg border border-forest/20 text-sm text-forest mb-2">
                                Vas a forzar una nueva contraseña para la cuenta vinculada a este CAD. El CAD podrá entrar inmediatamente utilizando estos datos.
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textLight mb-1">Usuario (Email Asignado)</label>
                                <input 
                                    type="text" 
                                    value={resetTargetEmail} 
                                    disabled
                                    className="w-full px-4 py-2 bg-sand/50 border border-border rounded-lg text-text font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textLight mb-1">Nueva Contraseña</label>
                                <input 
                                    type="text" 
                                    value={resetPasswordValue}
                                    onChange={(e) => setResetPasswordValue(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-border rounded-lg text-text focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textLight mb-1">Confirmar Contraseña</label>
                                <input 
                                    type="text" 
                                    value={resetPasswordConfirm}
                                    onChange={(e) => setResetPasswordConfirm(e.target.value)}
                                    placeholder="Repite la contraseña"
                                    className={`w-full px-4 py-2 bg-white border rounded-lg text-text focus:ring-2 focus:ring-accent outline-none ${
                                        resetPasswordConfirm && resetPasswordConfirm !== resetPasswordValue
                                            ? "border-red"
                                            : "border-border"
                                    }`}
                                />
                                {resetPasswordConfirm && resetPasswordConfirm !== resetPasswordValue && (
                                    <p className="text-red text-xs mt-1">Las contraseñas no coinciden</p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-sand/10 flex justify-end gap-3">
                            <button 
                                onClick={() => setResetModalOpen(false)}
                                disabled={isResetting}
                                className="px-5 py-2 text-textLight hover:text-text font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmResetPassword}
                                disabled={isResetting}
                                className="px-5 py-2 bg-forest text-white rounded-lg hover:bg-forestLight transition-colors font-medium shadow-sm disabled:opacity-50"
                            >
                                {isResetting ? "Guardando..." : "Asignar Accesos"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                title="Eliminar CAD"
                message={`¿Estás seguro de que deseas eliminar permanentemente "${deleteTarget.nombre}"? Esta acción borrará todos sus usuarios y formularios asociados. No se puede deshacer.`}
                confirmLabel="Eliminar permanentemente"
                onConfirm={confirmDeleteCad}
                onCancel={() => setDeleteModalOpen(false)}
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

/**
 * ProgressCell — Inline mini progress bar + percentage for the admin table.
 */
function ProgressCell({ progress }) {
    if (!progress || !progress.userEmail) {
        return <span className="text-textLight text-sm">—</span>;
    }

    if (progress.submittedAt) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full bg-forest rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="text-xs font-bold text-forest whitespace-nowrap">100%</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-forest">
                    <CheckCircle2 size={12} /> Enviado
                </span>
            </div>
        );
    }

    const pct = progress.progressPercent || 0;
    const barColor = pct === 0 ? 'bg-warmGray/30' : pct < 50 ? 'bg-accent' : 'bg-sage';

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden max-w-[100px]">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                />
            </div>
            <span className="text-xs font-medium text-textLight whitespace-nowrap">{pct}%</span>
        </div>
    );
}
