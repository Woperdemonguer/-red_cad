"use client";
import Link from 'next/link';
import { ClipboardList, Users, ArrowRight, UserCircle } from 'lucide-react';

export default function Dashboard() {

    const modules = [
        {
            title: "Mi Perfil",
            description: "Revisa los datos de tu perfil para ver que estén todos actualizados.",
            icon: UserCircle,
            href: "/profile",
            color: "text-accent",
            bg: "bg-accentLight"
        },
        {
            title: "Formulario: diagnóstico de partida",
            description: "Autoevalúa el estado de tu agrupación y actualiza tus datos estructurales.",
            icon: ClipboardList,
            href: "/form",
            color: "text-forest",
            bg: "bg-blueBgLight"
        },
        {
            title: "Directorio de CADs",
            description: "Explora los perfiles, fortalezas y datos de las asociaciones de la red.",
            icon: Users,
            href: "/directory",
            color: "text-sage",
            bg: "bg-blueBgLight"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-semibold text-text tracking-tight">Te damos la bienvenida a la Red de CAD</h1>
                <p className="text-warmGray mt-2 text-lg">Un espacio donde conectar y compartir de manera dinámica y en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {modules.map((mod, idx) => {
                    const Icon = mod.icon;
                    return (
                        <Link
                            key={idx}
                            href={mod.href}
                            className="group block bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${mod.bg}`}>
                                    <Icon size={24} className={mod.color} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center group-hover:bg-accent group-hover:text-text text-textLight transition-colors">
                                    <ArrowRight size={16} />
                                </div>
                            </div>

                            <h3 className="text-xl font-medium text-text mb-2">
                                {mod.title}
                            </h3>
                            <p className="text-warmGray text-sm leading-relaxed">
                                {mod.description}
                            </p>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
