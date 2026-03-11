import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-lg">
                <div className="text-6xl mb-6">🌿</div>
                <h1 className="text-3xl text-forest mb-4 font-normal">RedCAD Hub</h1>
                <p className="text-warmGray text-lg leading-relaxed mb-8">
                    Bienvenidas al sistema nervioso digital de la Red Estatal de Centros Agroecológicos de Distribución.
                </p>

                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                    <Link href="/login" className="bg-forest hover:bg-forestLight text-white px-6 py-3 rounded-lg text-sm font-sans tracking-wide transition-colors">
                        Acceder al espacio
                    </Link>
                </div>

                <p className="text-textLight text-sm mt-12 italic">
                    "Hay que cuidar la red para que la red nos cuide"
                </p>
            </div>
        </div>
    );
}
