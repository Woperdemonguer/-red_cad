"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    ClipboardList,
    Users,
    ShieldCheck,
    UserCircle,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const { email, isAdmin, loading, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Inicio", href: "/dashboard", icon: Home },
        { name: "Mi Perfil", href: "/profile", icon: UserCircle },
        { name: "Formulario", href: "/form", icon: ClipboardList },
        { name: "Miembros de la red", href: "/directory", icon: Users },
    ];

    if (isAdmin) {
        navigation.push({ name: "Panel Admin", href: "/admin", icon: ShieldCheck });
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Loading state while auth resolves */}
            {loading && (
                <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                    <LoadingSpinner message="Cargando..." />
                </div>
            )}
            {/* Top Navbar */}
            <header className="bg-white border-b border-border z-40 sticky top-0 shadow-sm flex-none">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3">
                            <img src="/Logo Giasat.png" alt="Giasat Logo" className="h-8 w-auto object-contain" />
                            <div className="flex flex-col justify-center border-l border-border pl-3 ml-1">
                                <span className="text-text font-semibold tracking-wide text-sm leading-tight">Red de CAD</span>
                                <span className="text-warmGray text-[10px] uppercase tracking-widest font-medium leading-tight">Intranet</span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center ml-8">
                            {navigation.map((item) => {
                                const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            px-4 py-2 rounded-md text-sm transition-all duration-200
                                            ${isActive 
                                                ? "bg-accent text-text font-semibold shadow-sm" 
                                                : "text-textLight hover:text-text hover:bg-sand"}
                                        `}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop User Area */}
                        <div className="hidden lg:flex items-center gap-4 border-l border-border pl-4">
                            <div className="text-xs text-textLight truncate max-w-[180px]" title={email}>
                                {email}
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-1.5 text-xs text-textLight hover:text-text bg-sand hover:bg-border px-3 py-1.5 rounded-full transition-colors"
                            >
                                <LogOut size={14} />
                                <span>Salir</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-textLight hover:text-text hover:bg-sand transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <aside
                className={`
                    fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-border transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl
                    ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
                `}
                aria-hidden={!isMobileMenuOpen}
                aria-label="Menú de navegación móvil"
            >
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="text-text font-semibold">Menú</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-textLight hover:text-text p-1">
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors
                                    ${isActive
                                        ? "bg-accent/20 text-text font-semibold"
                                        : "text-textLight hover:bg-sand hover:text-text"}
                                `}
                            >
                                <Icon size={18} className={isActive ? "text-accent" : "text-warmGray"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border bg-sand">
                    <div className="text-xs text-textLight mb-3 truncate px-2">
                        {email}
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center justify-center gap-2 text-sm text-red hover:text-white hover:bg-red py-2.5 rounded-lg transition-colors w-full border border-red/20"
                    >
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full flex flex-col">
                <div className="flex-1 p-4 lg:p-8 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
