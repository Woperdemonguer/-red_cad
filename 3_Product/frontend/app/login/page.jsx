"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { ArrowRight, Mail } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleAdminFastLogin = async () => {
        const devEmail = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
        const devPass = process.env.NEXT_PUBLIC_DEV_ADMIN_PASS;
        if (!devEmail || !devPass) { setMessage("Dev admin credentials not configured."); return; }
        setLoading(true);
        setMessage("Iniciando sesión como Administrador...");
        const { error } = await supabase.auth.signInWithPassword({
            email: devEmail,
            password: devPass,
        });

        if (error) {
            setMessage("Error: " + error.message);
            setLoading(false);
        } else {
            window.location.href = "/admin";
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/profile`,
            },
        });

        if (error) {
            setMessage("Error enviando el enlace: " + error.message);
        } else {
            setMessage("¡Enlace mágico enviado! Revisa tu bandeja de entrada.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">🌿</div>
                    <h1 className="text-2xl text-forest font-bold mb-2">Red de CAD / Intranet</h1>
                    <p className="text-warmGray text-sm mb-6">Acceso unificado para Coordinadoras de CAD y Secretaría Técnica.</p>

                    <div className="bg-sand/50 p-4 rounded-xl text-left border border-border">
                        <h3 className="text-forest text-sm font-semibold mb-2 flex items-center gap-2">
                            <Mail size={16} className="text-sage" /> ¿Cómo funciona el acceso?
                        </h3>
                        <ul className="text-sm text-textLight space-y-2 list-disc pl-4 marker:text-sage">
                            <li>Sin enredos: no necesitas recordar contraseñas.</li>
                            <li>Escribe tu correo y te enviaremos un <strong>enlace mágico</strong>.</li>
                            <li>Haz clic en el enlace desde tu correo para entrar directamente.</li>
                            <li><strong>Tu progreso se guarda automáticamente.</strong> Podrás continuar el formulario en cualquier momento volviendo a solicitar un enlace.</li>
                        </ul>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-textLight mb-1 block">Correo electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-border" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg outline-none focus:border-sage transition-colors text-text placeholder-textLight"
                                placeholder="coordinacion@tucad.org"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-forest hover:bg-forestLight text-white py-3 rounded-lg font-sans tracking-wide transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? "Enviando..." : "Enviar enlace mágico"}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
                        <>
                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink-0 mx-4 text-textLight text-xs tracking-wider uppercase">Modo Desarrollo</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAdminFastLogin}
                                disabled={loading}
                                className="w-full bg-sand hover:bg-[#e0ddd4] text-forest border border-border py-3 rounded-lg font-sans tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Iniciando..." : "⚡ Acceso Rápido Administrador"}
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    const devEmail = process.env.NEXT_PUBLIC_DEV_CAD_EMAIL;
                                    const devPass = process.env.NEXT_PUBLIC_DEV_CAD_PASS;
                                    if (!devEmail || !devPass) { setMessage("Dev CAD credentials not configured."); return; }
                                    setLoading(true);
                                    setMessage("Iniciando sesión como usuario CAD...");
                                    const { error } = await supabase.auth.signInWithPassword({
                                        email: devEmail,
                                        password: devPass,
                                    });
                                    if (error) {
                                        setMessage("Error: " + error.message);
                                        setLoading(false);
                                    } else {
                                        window.location.href = "/profile";
                                    }
                                }}
                                disabled={loading}
                                className="w-full bg-[#e8f0e8] hover:bg-[#d8e8d8] text-forest border border-sage py-3 rounded-lg font-sans tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Iniciando..." : "🌱 Acceso Rápido CAD (Ekoalde)"}
                            </button>
                        </>
                    )}
                </form>

                {message && (
                    <div className="mt-6 p-4 bg-cream border-l-4 border-sage rounded-r-lg text-sm text-text">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
