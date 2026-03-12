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
        <div className="min-h-screen bg-sand flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="bg-forest border-b border-forestLight z-40 sticky top-0 shadow-sm flex-none">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3">
                            <img src="/Logo Giasat.png" alt="Giasat Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
                            <div className="flex flex-col justify-center border-l border-white/20 pl-3 ml-1">
                                <span className="text-white font-semibold tracking-wide text-sm leading-tight">Red de CAD</span>
                                <span className="text-sage text-[10px] uppercase tracking-widest font-medium leading-tight">Intranet</span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center ml-8">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            px-4 py-2 rounded-md text-sm transition-all duration-200
                                            ${isActive 
                                                ? "bg-white text-forest font-semibold shadow-sm" 
                                                : "text-sage hover:text-white hover:bg-white/10"}
                                        `}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop User Area */}
                        <div className="hidden lg:flex items-center gap-4 border-l border-white/20 pl-4">
                            <div className="text-xs text-sage truncate max-w-[150px]">
                                {email}
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <LogOut size={14} />
                                <span>Salir</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-sage hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-forest border-l border-forestLight transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl
                ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
            `}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-white font-semibold">Menú</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-sage hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors
                                    ${isActive
                                        ? "bg-white text-forest font-semibold"
                                        : "text-sage hover:bg-white/10 hover:text-white"}
                                `}
                            >
                                <Icon size={18} className={isActive ? "text-forest" : "text-sage/80"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/10">
                    <div className="text-xs text-sage mb-3 truncate px-2">
                        {email}
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center justify-center gap-2 text-sm text-white/90 hover:text-white bg-red/20 hover:bg-red/40 py-2.5 rounded-lg transition-colors w-full"
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
