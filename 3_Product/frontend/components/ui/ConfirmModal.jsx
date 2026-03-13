/**
 * ConfirmModal — Branded confirmation dialog for destructive actions.
 * Replaces all `window.confirm()` calls with a consistent, accessible modal.
 *
 * @example
 *   <ConfirmModal
 *     open={showDelete}
 *     title="Eliminar CAD"
 *     message="¿Estás seguro de que deseas eliminar permanentemente este CAD?"
 *     confirmLabel="Eliminar"
 *     onConfirm={() => handleDelete()}
 *     onCancel={() => setShowDelete(false)}
 *     variant="danger"
 *   />
 *
 * Props:
 *   open:         Boolean — controls visibility
 *   title:        String — modal heading
 *   message:      String — descriptive text explaining the action
 *   confirmLabel: String — text for the confirm button (default: "Confirmar")
 *   cancelLabel:  String — text for the cancel button (default: "Cancelar")
 *   onConfirm:    Function — called when user confirms
 *   onCancel:     Function — called when user cancels or clicks overlay
 *   variant:      "danger" | "warning" | "default" — controls button color
 *   loading:      Boolean — disables buttons and shows loading state
 */
import { AlertTriangle, X } from "lucide-react";

const variantStyles = {
    danger: {
        icon: "bg-red/10 text-red",
        button: "bg-red text-white hover:bg-red/90",
    },
    warning: {
        icon: "bg-accent/10 text-accent",
        button: "bg-accent text-text hover:bg-accentHover",
    },
    default: {
        icon: "bg-forest/10 text-forest",
        button: "bg-forest text-white hover:bg-forestLight",
    },
};

export default function ConfirmModal({
    open,
    title = "¿Estás seguro?",
    message = "",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    variant = "danger",
    loading = false,
}) {
    if (!open) return null;

    const styles = variantStyles[variant] || variantStyles.default;

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${styles.icon}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-text">{title}</h3>
                        {message && (
                            <p className="text-sm text-textLight mt-2 leading-relaxed">{message}</p>
                        )}
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-textLight hover:text-text transition-colors shrink-0 p-1"
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-textLight hover:text-text border border-border rounded-lg hover:bg-sand transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 ${styles.button}`}
                    >
                        {loading ? "Procesando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
