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
        <div className="min-h-screen bg-sand flex">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-sm border border-border text-forest"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="h-full flex flex-col pt-8 pb-4">
                    {/* Logo Area */}
                    <div className="px-6 mb-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 mb-2">
                            <img src="/giasat-logo.png" alt="" className="h-10 w-auto object-contain" />
                            <span className="text-xl font-bold font-serif text-forest tracking-tight leading-none">Red de CAD</span>
                        </div>
                        <p className="text-xs text-warmGray uppercase tracking-wider font-medium mt-1">Intranet</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
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
                                            ? "bg-forest/10 text-forest font-medium"
                                            : "text-textLight hover:bg-sand hover:text-forest"}
                                    `}
                                >
                                    <Icon size={18} className={isActive ? "text-forest" : "text-sage"} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Area */}
                    <div className="px-6 mt-auto border-t border-border pt-4">
                        <div className="text-xs text-warmGray mb-3 truncate">
                            {email}
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 text-sm text-red hover:text-red/80 transition-colors w-full"
                        >
                            <LogOut size={16} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
