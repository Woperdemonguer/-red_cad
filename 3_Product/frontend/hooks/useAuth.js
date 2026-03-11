"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

/**
 * useAuth — Single source of truth for authentication and role resolution.
 *
 * Returns:
 *   - user:      Supabase auth user object (null while loading)
 *   - email:     Current user's email string
 *   - isAdmin:   Boolean — true if user_roles.role === 'admin' OR exists in admin_users_mapping
 *   - cadId:     UUID string — the CAD this user belongs to (null for admins without CAD mapping)
 *   - loading:   Boolean — true while auth and role resolution is in progress
 *   - signOut:   Function — signs out and redirects to /login
 *
 * Behavior:
 *   - Redirects to /login if no session exists
 *   - Admin detection uses two sources (user_roles table + admin_users_mapping) for resilience
 *   - CAD resolution queries cad_users_mapping for non-admin users
 *   - All queries run in parallel where possible for minimal latency
 */
export function useAuth() {
    const router = useRouter();
    const [state, setState] = useState({
        user: null,
        email: "",
        isAdmin: false,
        cadId: null,
        loading: true,
    });

    useEffect(() => {
        let cancelled = false;

        async function resolveAuth() {
            // 1. Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                router.push("/login");
                return;
            }

            const user = session.user;
            const email = user.email;

            // 2. Run admin checks and CAD mapping in parallel
            const [roleResult, adminMapResult, cadMapResult] = await Promise.all([
                supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", user.id)
                    .single(),
                supabase
                    .from("admin_users_mapping")
                    .select("id")
                    .eq("user_email", email)
                    .single(),
                supabase
                    .from("cad_users_mapping")
                    .select("cad_id")
                    .eq("user_email", email)
                    .single(),
            ]);

            if (cancelled) return;

            // 3. Determine admin status (either source is sufficient)
            const isAdmin =
                (roleResult.data?.role === "admin") ||
                (adminMapResult.data !== null);

            // 4. Determine CAD association
            const cadId = cadMapResult.data?.cad_id || null;

            setState({
                user,
                email,
                isAdmin,
                cadId,
                loading: false,
            });
        }

        resolveAuth();

        // Listen for auth state changes (login/logout in other tabs)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === "SIGNED_OUT") {
                    router.push("/login");
                }
                if (event === "SIGNED_IN") {
                    resolveAuth();
                }
            }
        );

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [router]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.push("/login");
    }, [router]);

    return {
        ...state,
        signOut,
    };
}
