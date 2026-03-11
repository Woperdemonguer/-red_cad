"use client";
import { useEffect, useState } from "react";
import { ShieldAlert, Users, LayoutDashboard, Settings, Trash2, PlusCircle, KeyRound, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileService, formService, supabase } from "@/lib/supabaseService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminResetUserPassword } from "@/app/actions/adminAuth";

export default function AdminDashboard() {
    const { isAdmin, loading: authLoading } = useAuth();
    const [cads, setCads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Password Reset Modal State
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [resetTargetEmail, setResetTargetEmail] = useState("");
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    // Fetch CAD list once auth resolves and user is admin
    useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        async function fetchCads() {
            try {
                const profiles = await profileService.listForAdmin();
                setCads(profiles);
            } catch (err) {
                toast.error(err.message);
            }
            setLoading(false);
        }

        fetchCads();
    }, [authLoading, isAdmin]);

    const handleOpenResetModal = async (cadId) => {
        const toastId = toast.loading("Buscando usuario vinculado...");
        try {
            const resolvedEmail = await formService.resolveEmail(cadId);
            toast.dismiss(toastId);
            
            if (!resolvedEmail) {
                toast.error("Este CAD no tiene un email de contacto asignado todavía.");
                return;
            }

            setResetTargetEmail(resolvedEmail);
            // Auto-generate a random secure-ish password pattern
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

        const toastId = toast.loading("Asignando contraseña...");
        setIsResetting(true);

        try {
            const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
            if (sessionErr || !session) throw new Error("No hay sesión activa de administrador.");

            const result = await adminResetUserPassword(session.access_token, resetTargetEmail, resetPasswordValue);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(result.message, { id: toastId });
            setResetModalOpen(false);
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
            window.location.href = `/profile?cad_id=${data.id}`;
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    const handleDeleteCad = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el CAD "${nombre}"? Esta acción borrará todos sus usuarios y formularios asociados.`)) return;

        const toastId = toast.loading("Eliminando agrupación...");
        try {
            await profileService.delete(id);
            setCads(cads.filter(cad => cad.id !== id));
            toast.success("Agrupación eliminada", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
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
                    <h1 className="text-3xl font-bold font-serif text-forest flex items-center gap-3">
                        <LayoutDashboard className="text-accent" /> Panel de Control (Admin)
                    </h1>
                    <p className="text-textLight mt-2 text-lg">
                        Visión global de las agrupaciones y control de la plataforma.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-textLight text-sm font-medium">Total CADs Registrados</p>
                            <h3 className="text-3xl font-bold font-serif text-forest mt-2">{cads.length}</h3>
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
                            <h3 className="text-3xl font-bold font-serif text-forest mt-2">—</h3>
                        </div>
                        <div className="p-3 bg-accent/10 rounded-lg text-accent">
                            <Settings size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-sand/30 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold font-serif text-forest">Directorio de Entidades</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCreateCad}
                            className="text-sm bg-forest text-white px-4 py-2 rounded-lg hover:bg-forestLight transition-colors flex items-center gap-2"
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
                                <th className="px-6 py-4 font-medium">DIAGNÓSTICO</th>
                                <th className="px-6 py-4 font-medium text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {cads.map((cad) => (
                                <tr key={cad.id} className="hover:bg-sand/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-text">{cad.nombre_comercial}</div>
                                        <div className="text-xs text-textLight mt-1">{cad.id.substring(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4 text-text">{cad.territorio || "-"}</td>
                                    <td className="px-6 py-4">
                                        {cad.estado === "Inactivo" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red/10 text-red">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red"></span>
                                                Inactivo
                                            </span>
                                        ) : cad.estado === "Satélite" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                Satélite
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage/20 text-forest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                                                {cad.estado || "Activo"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/form?cad_id=${cad.id}`}
                                            className="text-textLight hover:text-forest text-sm font-medium transition-colors inline-flex items-center gap-1"
                                        >
                                            Rellenar Formulario <span>→</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenResetModal(cad.id)}
                                                className="text-sage hover:text-forest text-sm font-medium transition-colors border border-border bg-white shadow-sm px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5"
                                                title="Gestionar Acceso"
                                            >
                                                <KeyRound size={16} /> Contraseña
                                            </button>
                                            <Link
                                                href={`/profile?cad_id=${cad.id}`}
                                                className="text-accent hover:text-forest text-sm font-medium transition-colors border border-border bg-white shadow-sm px-3 py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5"
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
                            ))}
                            {cads.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-textLight">
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
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in relative">
                        <div className="p-6 border-b border-border bg-sand/30 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-serif text-forest flex items-center gap-2">
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
                                    className="w-full px-4 py-2 bg-white border border-border rounded-lg text-text focus:ring-2 focus:ring-forest outline-none"
                                />
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
        </div>
    );
}
