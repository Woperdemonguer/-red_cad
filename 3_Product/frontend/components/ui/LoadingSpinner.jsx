/**
 * LoadingSpinner — Replaces 4+ duplicated loading spinners across the codebase.
 *
 * Usage:
 *   <LoadingSpinner />                  // default: centered, medium
 *   <LoadingSpinner size="sm" />        // small, inline
 *   <LoadingSpinner message="Cargando perfil..." />
 */
export default function LoadingSpinner({ size = "md", message }) {
    const sizeClasses = {
        sm: "h-5 w-5 border-b-[1.5px]",
        md: "h-8 w-8 border-b-2",
        lg: "h-12 w-12 border-b-2",
    };

    return (
        <div className="flex flex-col justify-center items-center h-full min-h-[50vh] gap-4">
            <div className={`animate-spin rounded-full border-forest ${sizeClasses[size]}`}></div>
            {message && (
                <p className="text-sm text-textLight animate-pulse">{message}</p>
            )}
        </div>
    );
}
