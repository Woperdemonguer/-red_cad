"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    Download,
    FileSpreadsheet,
    BarChart3,
    RefreshCw,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileService, formService } from "@/lib/supabaseService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
    buildProgressReport,
    progressReportToXlsx,
    answersToAggregatedXlsx,
    downloadXlsx,
} from "@/lib/reportUtils";

export default function AdminReportsPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const [cads, setCads] = useState([]);
    const [allForms, setAllForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);

    // Fetch data
    const fetchData = async () => {
        try {
            const [profiles, forms] = await Promise.all([
                profileService.listForAdminWithEmails(),
                formService.listAll(),
            ]);
            setCads(profiles);
            setAllForms(forms);
            setLastRefresh(new Date());
        } catch (err) {
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

    // Build progress report
    const progressReport = useMemo(() => {
        if (cads.length === 0) return [];
        return buildProgressReport(cads, allForms);
    }, [cads, allForms]);

    // Summary stats
    const submittedCount = useMemo(
        () => progressReport.filter((r) => r.submittedAt).length,
        [progressReport]
    );
    const inProgressCount = useMemo(
        () => progressReport.filter((r) => r.userEmail && !r.submittedAt && r.progressPercent > 0).length,
        [progressReport]
    );
    const notStartedCount = useMemo(
        () => progressReport.filter((r) => r.userEmail && r.progressPercent === 0 && !r.submittedAt).length,
        [progressReport]
    );
    const noEmailCount = useMemo(
        () => progressReport.filter((r) => !r.userEmail).length,
        [progressReport]
    );
    const averageProgress = useMemo(() => {
        const withEmail = progressReport.filter((r) => r.userEmail);
        if (withEmail.length === 0) return 0;
        const sum = withEmail.reduce((acc, r) => acc + r.progressPercent, 0);
        return Math.round(sum / withEmail.length);
    }, [progressReport]);

    // Export handlers
    const handleExportProgress = () => {
        if (progressReport.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }
        const xlsxBuffer = progressReportToXlsx(progressReport);
        const date = new Date().toISOString().slice(0, 10);
        downloadXlsx(xlsxBuffer, `informe_progreso_${date}.xlsx`);
        toast.success("Informe de progreso descargado.");
    };

    const handleExportAnswers = () => {
        if (cads.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }
        const xlsxBuffer = answersToAggregatedXlsx(cads, allForms);
        const date = new Date().toISOString().slice(0, 10);
        downloadXlsx(xlsxBuffer, `respuestas_diagnostico_${date}.xlsx`);
        toast.success("Respuestas descargadas.");
    };

    if (authLoading || loading) {
        return <LoadingSpinner message="Cargando informes..." />;
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
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 text-sm text-textLight hover:text-accent transition-colors mb-3"
                    >
                        <ArrowLeft size={14} /> Volver al panel
                    </Link>
                    <h1 className="text-3xl font-bold font-serif text-text flex items-center gap-3">
                        <BarChart3 className="text-accent" /> Informes y Exportaciones
                    </h1>
                    <p className="text-textLight mt-2 text-lg">
                        Descarga informes de progreso y datos agregados del diagnóstico.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="text-sm bg-white text-text px-4 py-2 rounded-lg hover:bg-sand transition-colors flex items-center gap-2 font-medium border border-border shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                        Actualizar
                    </button>
                    {lastRefresh && (
                        <span className="text-[11px] text-warmGray">
                            Última actualización: {lastRefresh.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                    label="Completados"
                    value={submittedCount}
                    icon={<CheckCircle2 size={18} />}
                    color="text-forest"
                    bg="bg-sage/20"
                />
                <StatCard
                    label="En Progreso"
                    value={inProgressCount}
                    icon={<Clock size={18} />}
                    color="text-accent"
                    bg="bg-accentLight"
                />
                <StatCard
                    label="Sin Empezar"
                    value={notStartedCount}
                    icon={<AlertCircle size={18} />}
                    color="text-red"
                    bg="bg-red/10"
                />
                <StatCard
                    label="Sin Email"
                    value={noEmailCount}
                    icon={<AlertCircle size={18} />}
                    color="text-textLight"
                    bg="bg-sand"
                />
                <StatCard
                    label="Progreso Medio"
                    value={`${averageProgress}%`}
                    icon={<BarChart3 size={18} />}
                    color="text-forest"
                    bg="bg-sage/20"
                />
            </div>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Report Export */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-sage/20 rounded-xl text-forest flex-shrink-0">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text">Informe de Progreso</h3>
                            <p className="text-sm text-textLight mt-1 leading-relaxed">
                                Estado de cada CAD: progreso general, preguntas respondidas,
                                desglose por bloque, y estado de envío.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-2">
                        <button
                            onClick={handleExportProgress}
                            className="flex-1 text-sm bg-forest text-white px-5 py-2.5 rounded-xl hover:bg-forestLight transition-colors flex items-center justify-center gap-2 font-bold shadow-sm"
                        >
                            <Download size={16} /> Descargar Excel
                        </button>
                    </div>
                    <p className="text-[11px] text-warmGray">
                        Formato: .xlsx · Una hoja con resumen de todas las entidades.
                    </p>
                </div>

                {/* Aggregated Answers Export */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-accentLight rounded-xl text-accent flex-shrink-0">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text">Respuestas Completas</h3>
                            <p className="text-sm text-textLight mt-1 leading-relaxed">
                                Todas las respuestas al diagnóstico, organizadas por bloque
                                temático en hojas separadas dentro del Excel.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-2">
                        <button
                            onClick={handleExportAnswers}
                            className="flex-1 text-sm bg-accent text-text px-5 py-2.5 rounded-xl hover:bg-accentHover transition-colors flex items-center justify-center gap-2 font-bold shadow-sm"
                        >
                            <Download size={16} /> Descargar Excel
                        </button>
                    </div>
                    <p className="text-[11px] text-warmGray">
                        Formato: .xlsx · Una hoja por bloque del formulario + hoja resumen.
                    </p>
                </div>
            </div>

            {/* Detailed Progress Table */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-blueBgLight/50">
                    <h2 className="text-xl font-bold font-serif text-text">Progreso por Entidad</h2>
                    <p className="text-sm text-textLight mt-1">
                        Desglose detallado del avance en el formulario de diagnóstico de cada CAD.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-sand/10 text-textLight text-sm border-b border-border">
                                <th className="px-6 py-4 font-medium">ENTIDAD</th>
                                <th className="px-6 py-4 font-medium">ESTADO</th>
                                <th className="px-6 py-4 font-medium">PROGRESO</th>
                                <th className="px-6 py-4 font-medium text-center">RESPONDIDAS</th>
                                <th className="px-6 py-4 font-medium text-center">DIAGNÓSTICO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {progressReport.map((row) => (
                                <tr key={row.cadId} className="hover:bg-sand/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-text">{row.cadName}</div>
                                        <div className="text-xs text-textLight mt-0.5">{row.territorio || "—"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.estado === "Inactivo" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red/10 text-red">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red"></span>
                                                Inactivo
                                            </span>
                                        ) : row.estado === "Satélite" ? (
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
                                        {row.userEmail ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2.5 bg-sand rounded-full overflow-hidden max-w-[140px]">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            row.submittedAt
                                                                ? "bg-forest"
                                                                : row.progressPercent > 0
                                                                    ? "bg-accent"
                                                                    : "bg-warmGray/30"
                                                        }`}
                                                        style={{ width: `${Math.max(row.progressPercent, 2)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-text min-w-[40px]">
                                                    {row.progressPercent}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-textLight text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.userEmail ? (
                                            <span className="text-sm text-text">
                                                {row.answeredQuestions}
                                                <span className="text-textLight"> / {row.totalQuestions}</span>
                                            </span>
                                        ) : (
                                            <span className="text-textLight text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {!row.userEmail ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sand text-textLight">
                                                Sin email
                                            </span>
                                        ) : row.submittedAt ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage/20 text-forest">
                                                <CheckCircle2 size={12} /> Enviado
                                            </span>
                                        ) : row.progressPercent > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent">
                                                <Clock size={12} /> En progreso
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red/10 text-red">
                                                Sin empezar
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {progressReport.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-textLight">
                                        No se encontraron datos de progreso.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * StatCard — Small summary metric card for the reports dashboard.
 */
function StatCard({ label, value, icon, color, bg }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${bg} ${color}`}>{icon}</div>
                <span className="text-xs text-textLight font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold font-serif text-text`}>{value}</p>
        </div>
    );
}
