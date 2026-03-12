"use client";
import { Component } from "react";

/**
 * ErrorBoundary — Catches unexpected render errors in the protected area
 * and shows a user-friendly fallback instead of a white screen.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="text-5xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-bold font-serif text-text mb-4">
                            Algo no ha ido bien
                        </h2>
                        <p className="text-textLight mb-6">
                            Se ha producido un error inesperado. Puedes intentar recargar la página.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="bg-accent text-text px-6 py-3 rounded-lg hover:bg-accentHover transition-colors font-bold"
                        >
                            Recargar página
                        </button>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="mt-6 text-left text-xs bg-red-50 p-4 rounded-lg border border-red-200 text-red-800 overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
