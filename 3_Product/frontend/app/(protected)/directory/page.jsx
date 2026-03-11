"use client";
import { useEffect, useState } from "react";
import { MapPin, Building, Users, Star } from "lucide-react";
import Link from "next/link";
import { profileService } from "@/lib/supabaseService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DirectoryPage() {
    const [cads, setCads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTerritory, setFilterTerritory] = useState("");
    const [error, setError] = useState(null);

    const fetchDirectory = async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await profileService.list();
            setCads(data);
        } catch (err) {
            setError("No se ha podido cargar el directorio. Comprueba tu conexión e inténtalo de nuevo.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDirectory();
    }, []);

    const territories = [...new Set(cads.map(c => c.territorio).filter(Boolean))];

    const filteredCads = cads.filter(cad => {
        // Exclude Inactive CADs from public directory
        if (cad.estado === "Inactivo") return false;

        const matchesSearch = cad.nombre_comercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cad.descripcion_corta?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTerritory = filterTerritory ? cad.territorio === filterTerritory : true;
        return matchesSearch && matchesTerritory;
    });

    if (loading) return <LoadingSpinner message="Cargando directorio..." />;

    if (error) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-border max-w-2xl mx-auto mt-12">
                <Users size={48} className="mx-auto text-red mb-4" />
                <h3 className="text-lg font-medium text-text mb-2">Error al cargar</h3>
                <p className="text-textLight mb-6">{error}</p>
                <button onClick={fetchDirectory} className="bg-forest text-white px-6 py-2 rounded-lg hover:bg-forestLight transition-colors">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-serif text-forest flex items-center gap-3">
                    <Users className="text-accent" size={32} /> Directorio de la Red
                </h1>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                <input
                    type="text"
                    placeholder="Buscar por nombre o palabra clave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-forest outline-none bg-sand/20"
                />
                <select
                    value={filterTerritory}
                    onChange={(e) => setFilterTerritory(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-forest outline-none bg-sand/20 min-w-[200px]"
                >
                    <option value="">Todos los Territorios</option>
                    {territories.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredCads.map(cad => {
                    return (
                        <Link
                            href={`/directory/${cad.id}`}
                            key={cad.id}
                            className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block"
                        >
                            <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                                {/* Logo Placeholder */}
                                <div className="w-24 h-24 rounded-full bg-sand/50 border border-border flex items-center justify-center flex-shrink-0 text-3xl font-serif text-forest/30 overflow-hidden">
                                    {cad.logo_url ? (
                                        <img src={cad.logo_url} alt={cad.nombre_comercial} className="w-full h-full object-cover" />
                                    ) : (
                                        cad.nombre_comercial?.[0]?.toUpperCase()
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-bold font-serif text-forest flex items-center justify-center md:justify-start gap-2 flex-wrap">
                                        {cad.nombre_comercial}
                                        {cad.grupo_motor === "Sí" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent/20 text-accent uppercase tracking-wider border border-accent/30">
                                                <Star size={12} className="fill-accent" /> Grupo Motor
                                            </span>
                                        )}
                                        {cad.estado === "Satélite" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage/30 text-forest uppercase tracking-wider border border-sage">
                                                Satélite
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-textLight font-medium">
                                        {cad.territorio && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sage/10 text-forest rounded-full">
                                                <MapPin size={14} /> {cad.territorio}
                                            </span>
                                        )}
                                        {cad.forma_juridica && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sand border border-border rounded-full">
                                                <Building size={14} /> {cad.forma_juridica}
                                            </span>
                                        )}
                                        {cad.num_socios_productoras && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-sand border border-border rounded-full">
                                                <Users size={14} /> {cad.num_socios_productoras} socias
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-4 text-text leading-relaxed">
                                        {cad.descripcion_corta || "Sin descripción proporcionada."}
                                    </p>
                                </div>

                                <div className="text-forest flex-shrink-0 md:self-center flex flex-col items-center">
                                    <span className="text-sm font-medium">Ver Perfil</span>
                                    <span className="mt-1">→</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {filteredCads.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-xl border border-border">
                        <Users size={48} className="mx-auto text-border mb-4" />
                        <h3 className="text-lg font-medium text-textLight">No se encontraron perfiles</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
